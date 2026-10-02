import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { connectDatabase } from './db.js';
import { requireAuth } from './middleware/auth.js';
import { Analysis } from './models/Analysis.js';
import { Website } from './models/Website.js';
import { Report } from './models/Report.js';
import { User } from './models/User.js';
import { Notification } from './models/Notification.js';
import { parseAndValidateUrl } from './lib/ssrf.js';
import { normalizeUrl, getDomainFromUrl, getFaviconUrl } from './lib/helpers.js';
import { runRealAudit } from './lib/audit.js';
import axios from 'axios';
import { config, hasValidFirebaseConfig, hasValidGeminiConfig } from './config.js';
import { firebaseAdmin } from './firebase.js';
import type { Request, Response } from 'express';

const app = express();
const progressStore = new Map<string, { stage: string; progress: number; message: string }>();
const port = config.port;

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

function sendError(res: Response, status: number, message: string) {
  return res.status(status).json({ success: false, message });
}

app.get('/api/health', async (_req, res) => {
  let mongo = false;
  let firebase = false;
  let gemini = false;

  try {
    mongo = mongoose.connection.readyState === 1;
  } catch {
    mongo = false;
  }

  try {
    firebase = Boolean(firebaseAdmin.apps.length && hasValidFirebaseConfig());
    if (firebase) {
      await firebaseAdmin.auth().listUsers(1);
    }
  } catch {
    firebase = false;
  }

  try {
    if (hasValidGeminiConfig() && config.geminiModel) {
      const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.geminiApiKey}`);
      gemini = Array.isArray(response.data?.models) && response.data.models.some((model: any) => typeof model?.name === 'string' && model.name.includes(config.geminiModel));
    }
  } catch {
    gemini = false;
  }

  const status = {
    ok: mongo && firebase && gemini,
    mongo,
    firebase,
    gemini,
    mode: config.mongoUri ? 'configured' : 'development',
  };
  res.json(status);
});

app.get('/api/analysis/progress/:analysisId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  const push = (entry?: { stage: string; progress: number; message: string }) => {
    if (!entry) return;
    res.write(`event: progress\ndata: ${JSON.stringify(entry)}\n\n`);
  };

  const current = progressStore.get(req.params.analysisId);
  if (current) push(current);

  const timer = setInterval(() => {
    const latest = progressStore.get(req.params.analysisId);
    if (!latest) {
      clearInterval(timer);
      res.end();
      return;
    }
    push(latest);
  }, 1000);

  req.on('close', () => clearInterval(timer));
});

app.post('/api/analysis/start', requireAuth, async (req: Request, res: Response) => {
  try {
    const url = typeof req.body?.url === 'string' ? req.body.url : '';
    const validationError = parseAndValidateUrl(url)?.href ? null : (() => {
      try {
        parseAndValidateUrl(url);
        return null;
      } catch (error) {
        return (error as Error).message;
      }
    })();

    if (validationError) {
      return sendError(res, 400, validationError);
    }

    const normalized = normalizeUrl(url);
    const domain = getDomainFromUrl(normalized);
    const favicon = getFaviconUrl(normalized);

    const analysis = await Analysis.create({
      userId: req.userId,
      url: normalized,
      status: 'running',
      overallScore: 0,
      startedAt: new Date(),
    });

    const website = await Website.findOneAndUpdate(
      { userId: req.userId, normalizedUrl: normalized },
      {
        userId: req.userId,
        url: normalized,
        normalizedUrl: normalized,
        domain,
        favicon,
        latestStatus: 'running',
        lastAnalyzedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    progressStore.set(String(analysis._id), { stage: 'validation', progress: 10, message: 'Validating URL' });

    try {
      const audit = await runRealAudit(normalized, (stage, progress, message) => {
        progressStore.set(String(analysis._id), { stage, progress, message });
      });

      const completedAnalysis = await Analysis.findByIdAndUpdate(
        analysis._id,
        {
          websiteId: website._id,
          status: 'completed',
          overallScore: audit.analysis.overallScore,
          performance: audit.analysis.performance,
          seo: audit.analysis.seo,
          accessibility: audit.analysis.accessibility,
          security: audit.analysis.security,
          mobile: audit.analysis.mobile,
          technical: audit.analysis.technical,
          aiSummary: audit.analysis.aiSummary || 'Audit completed successfully.',
          aiRecommendations: audit.analysis.aiRecommendations || [],
          completedAt: new Date(),
          duration: Date.now() - new Date(analysis.startedAt as Date).getTime(),
          findings: audit.analysis.findings || [],
          reportData: audit.analysis.reportData || {},
        },
        { new: true },
      );

      await Website.findByIdAndUpdate(website._id, {
        latestScore: completedAnalysis?.overallScore ?? 0,
        latestStatus: completedAnalysis?.status ?? 'completed',
        lastAnalyzedAt: new Date(),
      });

      await Report.findOneAndUpdate(
        { userId: req.userId, analysisId: String(completedAnalysis?._id) },
        {
          userId: req.userId,
          analysisId: String(completedAnalysis?._id),
          websiteId: website._id,
          reportData: completedAnalysis?.reportData || {},
        },
        { upsert: true, new: true },
      );

      await Notification.create({
        userId: req.userId,
        type: 'analysis_completed',
        title: 'Audit complete',
        message: `Your website audit for ${domain} is complete.`,
        read: false,
      });

      progressStore.set(String(analysis._id), { stage: 'completed', progress: 100, message: 'Completed' });
      return res.json({ success: true, analysisId: completedAnalysis?._id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Website could not be analyzed';
      await Analysis.findByIdAndUpdate(analysis._id, {
        status: 'failed',
        error: message,
        completedAt: new Date(),
      });
      await Notification.create({
        userId: req.userId,
        type: 'analysis_failed',
        title: 'Audit failed',
        message: message,
        read: false,
      });
      progressStore.set(String(analysis._id), { stage: 'failed', progress: 100, message: message });
      return sendError(res, 400, `Website could not be fully analyzed. ${message}`);
    }
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : 'Unable to start analysis.');
  }
});

app.get('/api/analysis', requireAuth, async (req, res) => {
  const items = await Analysis.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

app.get('/api/analysis/:id', requireAuth, async (req, res) => {
  const item = await Analysis.findOne({ _id: req.params.id, userId: req.userId });
  if (!item) return sendError(res, 404, 'Analysis not found.');
  res.json({ success: true, data: item });
});

app.delete('/api/analysis/:id', requireAuth, async (req, res) => {
  const deleted = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!deleted) return sendError(res, 404, 'Analysis not found.');
  res.json({ success: true });
});

app.post('/api/analysis/:id/recheck', requireAuth, async (req, res) => {
  const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.userId });
  if (!analysis) return sendError(res, 404, 'Analysis not found.');
  return app._router.handle({ ...req, body: { url: analysis.url } }, res) as any;
});

app.get('/api/websites', requireAuth, async (req, res) => {
  const items = await Website.find({ userId: req.userId }).sort({ lastAnalyzedAt: -1, createdAt: -1 });
  res.json({ success: true, data: items });
});

app.post('/api/websites', requireAuth, async (req: Request, res: Response) => {
  try {
    const url = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

    if (!url) {
      return sendError(res, 400, 'Website URL is required.');
    }

    const validationError = parseAndValidateUrl(url)?.href ? null : (() => {
      try {
        parseAndValidateUrl(url);
        return null;
      } catch (error) {
        return (error as Error).message;
      }
    })();

    if (validationError) {
      return sendError(res, 400, validationError);
    }

    const normalized = normalizeUrl(url);
    const domain = getDomainFromUrl(normalized);
    const favicon = getFaviconUrl(normalized);
    const existing = await Website.findOne({ userId: req.userId, normalizedUrl: normalized });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This website is already in your workspace.' });
    }

    const website = await Website.create({
      userId: req.userId,
      name: name || domain,
      url: normalized,
      normalizedUrl: normalized,
      domain,
      favicon,
      latestScore: 0,
      latestStatus: 'never_analyzed',
    });

    return res.status(201).json({ success: true, data: website });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : 'Unable to add website.');
  }
});

app.put('/api/websites/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const website = await Website.findOne({ _id: req.params.id, userId: req.userId });
    if (!website) return sendError(res, 404, 'Website not found.');

    const nextUrl = typeof req.body?.url === 'string' ? req.body.url.trim() : website.url;
    const nextName = typeof req.body?.name === 'string' ? req.body.name.trim() : website.name || website.domain;

    if (!nextUrl) return sendError(res, 400, 'Website URL is required.');

    const validationError = parseAndValidateUrl(nextUrl)?.href ? null : (() => {
      try {
        parseAndValidateUrl(nextUrl);
        return null;
      } catch (error) {
        return (error as Error).message;
      }
    })();

    if (validationError) {
      return sendError(res, 400, validationError);
    }

    const normalized = normalizeUrl(nextUrl);
    const domain = getDomainFromUrl(normalized);
    const favicon = getFaviconUrl(normalized);

    const duplicate = await Website.findOne({ userId: req.userId, normalizedUrl: normalized, _id: { $ne: website._id } });
    if (duplicate) {
      return res.status(409).json({ success: false, message: 'Another website in your workspace already uses this URL.' });
    }

    const updated = await Website.findOneAndUpdate(
      { _id: website._id, userId: req.userId },
      {
        name: nextName || domain,
        url: normalized,
        normalizedUrl: normalized,
        domain,
        favicon,
      },
      { new: true },
    );

    return res.json({ success: true, data: updated });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : 'Unable to update website.');
  }
});

app.get('/api/websites/:id', requireAuth, async (req, res) => {
  const item = await Website.findOne({ _id: req.params.id, userId: req.userId });
  if (!item) return sendError(res, 404, 'Website not found.');
  res.json({ success: true, data: item });
});

app.delete('/api/websites/:id', requireAuth, async (req, res) => {
  const item = await Website.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!item) return sendError(res, 404, 'Website not found.');

  await Analysis.deleteMany({ userId: req.userId, websiteId: req.params.id });
  await Report.deleteMany({ userId: req.userId, websiteId: req.params.id });

  res.json({ success: true });
});

app.get('/api/reports', requireAuth, async (req, res) => {
  const items = await Report.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

app.get('/api/reports/:id', requireAuth, async (req, res) => {
  const item = await Report.findOne({ _id: req.params.id, userId: req.userId });
  if (!item) return sendError(res, 404, 'Report not found.');
  res.json({ success: true, data: item });
});

app.delete('/api/reports/:id', requireAuth, async (req, res) => {
  const item = await Report.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!item) return sendError(res, 404, 'Report not found.');
  res.json({ success: true });
});

app.get('/api/profile', requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.userId });
  if (!user) return sendError(res, 404, 'Profile not found.');

  const stats = {
    websites: await Website.countDocuments({ userId: req.userId }),
    analyses: await Analysis.countDocuments({ userId: req.userId }),
    reports: await Report.countDocuments({ userId: req.userId }),
  };

  res.json({ success: true, data: { ...user.toObject(), stats } });
});

app.put('/api/profile', requireAuth, async (req, res) => {
  const updates = {
    name: req.body?.name,
    bio: req.body?.bio,
    website: req.body?.website,
    location: req.body?.location,
    aiPreference: req.body?.aiPreference,
  };

  const user = await User.findOneAndUpdate({ firebaseUid: req.userId }, updates, { upsert: true, new: true });
  res.json({ success: true, data: user });
});

app.get('/api/notifications', requireAuth, async (req, res) => {
  const items = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

app.put('/api/notifications/:id/read', requireAuth, async (req, res) => {
  const item = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { read: true }, { new: true });
  if (!item) return sendError(res, 404, 'Notification not found.');
  res.json({ success: true, data: item });
});

app.delete('/api/notifications/:id', requireAuth, async (req, res) => {
  const item = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!item) return sendError(res, 404, 'Notification not found.');
  res.json({ success: true });
});

app.post('/api/ai/chat', requireAuth, async (req, res) => {
  try {
    const question = typeof req.body?.question === 'string' ? req.body.question : '';
    const analysisId = req.body?.analysisId;
    const analysis = await Analysis.findOne({ _id: analysisId, userId: req.userId });
    const apiKey = config.geminiApiKey;

    if (!question) return sendError(res, 400, 'Question is required.');
    if (!hasValidGeminiConfig()) {
      return res.json({ success: true, data: { answer: 'Gemini is not configured. Please add a valid Gemini API key to enable AI assistance.' } });
    }

    const context = analysis ? JSON.stringify({
      url: analysis.url,
      overallScore: analysis.overallScore,
      performance: analysis.performance,
      seo: analysis.seo,
      accessibility: analysis.accessibility,
      security: analysis.security,
      mobile: analysis.mobile,
      technical: analysis.technical,
    }, null, 2) : 'No analysis data available.';

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${apiKey}`,
      {
        contents: [{
          role: 'user',
          parts: [{
            text: `Use the supplied audit data only. Do not invent facts. If the data is insufficient, say so.\n\nAudit data:\n${context}\n\nUser question: ${question}`,
          }],
        }],
      },
      { timeout: 40000 },
    );

    const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not determine an answer from the audit data.';
    res.json({ success: true, data: { answer } });
  } catch (error) {
    res.json({ success: true, data: { answer: 'Gemini is temporarily unavailable. Please try again later.' } });
  }
});

app.use((req, res) => {
  sendError(res, 404, 'Route not found.');
});

async function startServer() {
  try {
    if (config.mongoUri) {
      await connectDatabase();
    }
  } catch (error) {
    console.warn('MongoDB connection issue:', error instanceof Error ? error.message : error);
  }

  app.listen(port, () => {
    console.log(`CheckMySite server running on http://localhost:${port}`);
  });
}

startServer();
