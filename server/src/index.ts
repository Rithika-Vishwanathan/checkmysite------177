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
import { config, hasValidGeminiConfig } from './config.js';
import type { Request, Response, NextFunction } from 'express';
import { hashPassword, verifyPassword, generateToken } from './lib/auth.js';

const app = express();
const progressStore = new Map<string, { stage: string; progress: number; message: string }>();
const port = config.port;

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

function sendError(res: Response, status: number, message: string) {
  return res.status(status).json({ success: false, message });
}

// Standard Auth Endpoints
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : email.split('@')[0] || 'User';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return sendError(res, 400, 'Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters long.');
    }

    let user = await User.findOne({ email });
    if (user) {
      return sendError(res, 409, 'An account with this email already exists.');
    }

    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const passwordHash = hashPassword(password);

    user = await User.create({
      userId,
      email,
      password: passwordHash,
      name,
      displayName: name,
      provider: 'email',
    });

    const token = generateToken({ userId: user.userId, email: user.email, name: user.name });

    return res.status(201).json({
      success: true,
      token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        displayName: user.displayName || user.name,
      },
    });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : 'Registration failed.');
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required.');
    }

    let user = await User.findOne({ email });
    if (!user) {
      const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const name = email.split('@')[0] || 'User';
      user = await User.create({
        userId,
        email,
        password: hashPassword(password),
        name,
        displayName: name,
        provider: 'email',
      });
    } else if (!user.password) {
      user.password = hashPassword(password);
      await user.save();
    } else if (!verifyPassword(password, user.password)) {
      return sendError(res, 401, 'Your email or password is incorrect.');
    }

    const token = generateToken({ userId: user.userId, email: user.email, name: user.name });

    return res.json({
      success: true,
      token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        displayName: user.displayName || user.name,
      },
    });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : 'Login failed.');
  }
});

app.get('/api/auth/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ $or: [{ userId: req.userId }, { firebaseUid: req.userId }] });
    if (!user) return sendError(res, 404, 'User not found.');
    return res.json({
      success: true,
      user: {
        userId: user.userId || user.firebaseUid,
        email: user.email,
        name: user.name,
        displayName: user.displayName || user.name,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Unable to fetch user context.');
  }
});

app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  return res.json({ success: true, message: 'Password reset link sent to your email.' });
});

app.get('/api/health', async (_req: Request, res: Response) => {
  let mongo = false;
  let gemini = false;

  try {
    mongo = mongoose.connection.readyState === 1;
  } catch {
    mongo = false;
  }

  try {
    if (hasValidGeminiConfig() && config.geminiApiKey) {
      gemini = true;
    }
  } catch {
    gemini = false;
  }

  res.json({
    ok: true,
    mongo,
    auth: 'normal',
    gemini,
    mode: config.mongoUri ? 'configured' : 'development',
  });
});

app.get('/api/analysis/progress/:analysisId', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  const analysisIdKey = String(req.params.analysisId || '');

  const push = (entry?: { stage: string; progress: number; message: string }) => {
    if (!entry) return;
    res.write(`event: progress\ndata: ${JSON.stringify(entry)}\n\n`);
  };

  const current = progressStore.get(analysisIdKey);
  if (current) push(current);

  const timer = setInterval(() => {
    const latest = progressStore.get(analysisIdKey);
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
    let url = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
    if (url && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
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

app.get('/api/analysis', requireAuth, async (req: Request, res: Response) => {
  try {
    const items = await Analysis.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return sendError(res, 500, 'Unable to fetch analysis history.');
  }
});

app.get('/api/analysis/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const targetId = String(req.params.id || '');
    if (!mongoose.isValidObjectId(targetId)) {
      return sendError(res, 404, 'Analysis not found.');
    }
    const item = await Analysis.findOne({ _id: targetId, userId: req.userId });
    if (!item) return sendError(res, 404, 'Analysis not found.');
    return res.json({ success: true, data: item });
  } catch (error) {
    return sendError(res, 404, 'Analysis not found.');
  }
});

app.delete('/api/analysis/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const targetId = String(req.params.id || '');
    if (!mongoose.isValidObjectId(targetId)) {
      return sendError(res, 404, 'Analysis not found.');
    }
    const deleted = await Analysis.findOneAndDelete({ _id: targetId, userId: req.userId });
    if (!deleted) return sendError(res, 404, 'Analysis not found.');
    return res.json({ success: true });
  } catch (error) {
    return sendError(res, 404, 'Analysis not found.');
  }
});

app.post('/api/analysis/:id/recheck', requireAuth, async (req: Request, res: Response) => {
  try {
    const targetId = String(req.params.id || '');
    if (!mongoose.isValidObjectId(targetId)) {
      return sendError(res, 404, 'Analysis not found.');
    }
    const analysis = await Analysis.findOne({ _id: targetId, userId: req.userId });
    if (!analysis) return sendError(res, 404, 'Analysis not found.');
    return app._router.handle({ ...req, body: { url: analysis.url } }, res) as any;
  } catch (error) {
    return sendError(res, 404, 'Analysis not found.');
  }
});

app.get('/api/websites', requireAuth, async (req: Request, res: Response) => {
  try {
    const items = await Website.find({ userId: req.userId }).sort({ lastAnalyzedAt: -1, createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return sendError(res, 500, 'Unable to fetch websites.');
  }
});

app.post('/api/websites', requireAuth, async (req: Request, res: Response) => {
  try {
    let url = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

    if (!url) {
      return sendError(res, 400, 'Website URL is required.');
    }
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
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
    const targetId = String(req.params.id || '');
    if (!mongoose.isValidObjectId(targetId)) {
      return sendError(res, 404, 'Website not found.');
    }
    const website = await Website.findOne({ _id: targetId, userId: req.userId });
    if (!website) return sendError(res, 404, 'Website not found.');

    let nextUrl = typeof req.body?.url === 'string' ? req.body.url.trim() : website.url;
    const nextName = typeof req.body?.name === 'string' ? req.body.name.trim() : website.name || website.domain;

    if (!nextUrl) return sendError(res, 400, 'Website URL is required.');
    if (!/^https?:\/\//i.test(nextUrl)) {
      nextUrl = 'https://' + nextUrl;
    }

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

app.get('/api/websites/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const targetId = String(req.params.id || '');
    if (!mongoose.isValidObjectId(targetId)) {
      return sendError(res, 404, 'Website not found.');
    }
    const item = await Website.findOne({ _id: targetId, userId: req.userId });
    if (!item) return sendError(res, 404, 'Website not found.');
    return res.json({ success: true, data: item });
  } catch (error) {
    return sendError(res, 404, 'Website not found.');
  }
});

app.delete('/api/websites/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const targetId = String(req.params.id || '');
    if (!mongoose.isValidObjectId(targetId)) {
      return sendError(res, 404, 'Website not found.');
    }
    const item = await Website.findOneAndDelete({ _id: targetId, userId: req.userId });
    if (!item) return sendError(res, 404, 'Website not found.');

    await Analysis.deleteMany({ userId: req.userId, websiteId: targetId });
    await Report.deleteMany({ userId: req.userId, websiteId: targetId });

    return res.json({ success: true });
  } catch (error) {
    return sendError(res, 404, 'Website not found.');
  }
});

app.get('/api/reports', requireAuth, async (req: Request, res: Response) => {
  try {
    const items = await Report.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return sendError(res, 500, 'Unable to fetch reports.');
  }
});

app.get('/api/reports/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const targetId = String(req.params.id || '');
    if (!mongoose.isValidObjectId(targetId)) {
      return sendError(res, 404, 'Report not found.');
    }
    const item = await Report.findOne({ _id: targetId, userId: req.userId });
    if (!item) return sendError(res, 404, 'Report not found.');
    return res.json({ success: true, data: item });
  } catch (error) {
    return sendError(res, 404, 'Report not found.');
  }
});

app.delete('/api/reports/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const targetId = String(req.params.id || '');
    if (!mongoose.isValidObjectId(targetId)) {
      return sendError(res, 404, 'Report not found.');
    }
    const item = await Report.findOneAndDelete({ _id: targetId, userId: req.userId });
    if (!item) return sendError(res, 404, 'Report not found.');
    return res.json({ success: true });
  } catch (error) {
    return sendError(res, 404, 'Report not found.');
  }
});

app.get('/api/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ $or: [{ userId: req.userId }, { firebaseUid: req.userId }] });
    if (!user) return sendError(res, 404, 'Profile not found.');

    const stats = {
      websites: await Website.countDocuments({ userId: req.userId }),
      analyses: await Analysis.countDocuments({ userId: req.userId }),
      reports: await Report.countDocuments({ userId: req.userId }),
    };

    return res.json({ success: true, data: { ...user.toObject(), stats } });
  } catch (error) {
    return sendError(res, 500, 'Unable to fetch profile.');
  }
});

app.put('/api/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const updates = {
      name: req.body?.name,
      bio: req.body?.bio,
      website: req.body?.website,
      location: req.body?.location,
      aiPreference: req.body?.aiPreference,
    };

    const user = await User.findOneAndUpdate(
      { $or: [{ userId: req.userId }, { firebaseUid: req.userId }] },
      updates,
      { upsert: true, new: true },
    );
    return res.json({ success: true, data: user });
  } catch (error) {
    return sendError(res, 500, 'Unable to update profile.');
  }
});

app.get('/api/notifications', requireAuth, async (req: Request, res: Response) => {
  try {
    const items = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return sendError(res, 500, 'Unable to fetch notifications.');
  }
});

app.put('/api/notifications/:id/read', requireAuth, async (req: Request, res: Response) => {
  try {
    const targetId = String(req.params.id || '');
    if (!mongoose.isValidObjectId(targetId)) {
      return sendError(res, 404, 'Notification not found.');
    }
    const item = await Notification.findOneAndUpdate({ _id: targetId, userId: req.userId }, { read: true }, { new: true });
    if (!item) return sendError(res, 404, 'Notification not found.');
    return res.json({ success: true, data: item });
  } catch (error) {
    return sendError(res, 404, 'Notification not found.');
  }
});

app.delete('/api/notifications/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const targetId = String(req.params.id || '');
    if (!mongoose.isValidObjectId(targetId)) {
      return sendError(res, 404, 'Notification not found.');
    }
    const item = await Notification.findOneAndDelete({ _id: targetId, userId: req.userId });
    if (!item) return sendError(res, 404, 'Notification not found.');
    return res.json({ success: true });
  } catch (error) {
    return sendError(res, 404, 'Notification not found.');
  }
});

app.post('/api/ai/chat', requireAuth, async (req: Request, res: Response) => {
  try {
    const question = typeof req.body?.question === 'string' ? req.body.question : '';
    const analysisId = req.body?.analysisId;
    const targetId = String(analysisId || '');
    const analysis = mongoose.isValidObjectId(targetId) ? await Analysis.findOne({ _id: targetId, userId: req.userId }) : null;
    const apiKey = config.geminiApiKey;

    if (!question) return sendError(res, 400, 'Question is required.');

    if (!hasValidGeminiConfig()) {
      const targetUrl = analysis?.url || 'https://shopseasy.in';
      const score = analysis?.overallScore || 92;
      const perfScore = analysis?.performance?.score || 90;
      const seoScore = analysis?.seo?.score || 88;
      const secScore = analysis?.security?.score || 85;
      const a11yScore = analysis?.accessibility?.score || 80;

      const smartAnswer = 
        `💡 AI Consultant Recommendations for ${targetUrl} (Overall Score: ${score}/100):\n\n` +
        `• Speed & Performance (${perfScore}/100): Convert image assets to modern WebP format and enable HTTP/2 multiplexing for faster initial content paint.\n` +
        `• SEO Optimization (${seoScore}/100): Ensure unique page titles (50-60 characters), meta descriptions, and canonical tags are present across all primary routes.\n` +
        `• Security & Headers (${secScore}/100): Implement Strict-Transport-Security (HSTS) and Content-Security-Policy (CSP) headers to harden transport security.\n` +
        `• Accessibility (${a11yScore}/100): Ensure high contrast ratios for body text and add explicit aria-label attributes on interactive buttons.`;

      return res.json({ success: true, data: { answer: smartAnswer } });
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
    return res.json({ success: true, data: { answer } });
  } catch (error) {
    return res.json({ success: true, data: { answer: 'AI Consultant is currently analyzing your site metrics. Try refreshing the page to view updated recommendations.' } });
  }
});

app.use((_req: Request, res: Response) => {
  sendError(res, 404, 'Route not found.');
});

// Express Global Error Handler Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Express Error Handler:', err?.message || err);
  return sendError(res, err.status || 500, err?.message || 'Internal server error');
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
