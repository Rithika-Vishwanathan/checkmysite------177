import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { load } from 'cheerio';
import { parseAndValidateUrl } from './ssrf.js';
import { safeFetchHtml, normalizeUrl, clampScore, getFaviconUrl, getDomainFromUrl } from './helpers.js';
import { AxeBuilder } from '@axe-core/playwright';

function buildFinding(title: string, severity: string, description: string, evidence: string, recommendation: string) {
  return { title, severity, description, evidence, recommendation };
}

function scoreFromFindings(findings: Array<{ severity: string }>) {
  const penaltyMap = { critical: 25, high: 18, medium: 10, low: 5, info: 2 } as Record<string, number>;
  const totalPenalty = findings.reduce<number>((sum, item) => sum + (penaltyMap[item.severity] || 0), 0);
  return clampScore(100 - totalPenalty);
}

export async function runRealAudit(url: string, onProgress?: (stage: string, progress: number, message: string) => void) {
  const stage = (name: string, progress: number, message: string) => onProgress?.(name, progress, message);

  stage('validation', 5, 'Validating URL');
  const validated = parseAndValidateUrl(url);
  const normalized = normalizeUrl(validated.href);
  const domain = getDomainFromUrl(normalized);
  const favicon = getFaviconUrl(normalized);

  stage('loading', 18, 'Resolving and loading website');
  let page;
  let html = '';
  let finalUrl = normalized;
  let responseStatus = 0;
  let responseHeaders: Record<string, any> = {};
  let redirectChain: string[] = [];

  try {
    const browser = await chromium.launch({ headless: true });
    page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const response = await page.goto(normalized, { waitUntil: 'domcontentloaded', timeout: 45000 });
    finalUrl = page.url();
    responseStatus = response?.status() || 0;
    responseHeaders = response?.headers?.() || {};
    redirectChain = response?.request()?.redirectedFrom() ? [response.request().redirectedFrom()?.url() || ''] : [];
    html = await page.content();
    await browser.close();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Website could not be loaded';
    throw new Error(message);
  }

  stage('performance', 35, 'Running Lighthouse performance audit');
  let lighthouseReport: any = { categories: {} };
  try {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'] });
    const result = await lighthouse(normalized, {
      port: chrome.port,
      output: 'json',
      onlyCategories: ['performance'],
      disableStorageReset: true,
    });
    lighthouseReport = result?.lhr || { categories: {} };
    await chrome.kill();
  } catch (error) {
    console.warn('Lighthouse failed:', error);
  }

  stage('seo', 52, 'Inspecting HTML metadata and SEO structure');
  const htmlResponse = await safeFetchHtml(normalized).catch(() => null);
  const seoHtml = htmlResponse?.data || html || '';
  const $ = load(seoHtml);
  const findings: any[] = [];

  const title = $('title').first().text().trim();
  if (!title) findings.push(buildFinding('Missing title', 'high', 'The page has no title.', 'No <title> tag found.', 'Add a unique page title.'));
  if (title.length > 60) findings.push(buildFinding('Title too long', 'medium', 'The title exceeds recommended length.', `Title length: ${title.length}.`, 'Shorten the title to around 50-60 characters.'));
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  if (!metaDesc) findings.push(buildFinding('Missing meta description', 'medium', 'No meta description was found for the page.', 'No meta description tag is present.', 'Add a unique meta description to each page.'));
  const h1Count = $('h1').length;
  if (h1Count === 0) findings.push(buildFinding('Missing H1', 'medium', 'The page has no H1 heading.', 'The document does not contain an h1 element.', 'Add one clear H1 describing the page.'));
  if ($('a[href]').length === 0) findings.push(buildFinding('No links found', 'info', 'The page has no obvious internal or external links.', 'No anchor elements with href values were found.', 'Add relevant links where appropriate.'));
  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) findings.push(buildFinding('Missing canonical tag', 'low', 'Canonical metadata is missing.', 'No canonical link tag was found.', 'Add a rel="canonical" tag to avoid duplicate-content issues.'));
  const robotsMeta = $('meta[name="robots"]').attr('content');
  if (!robotsMeta) findings.push(buildFinding('Robots meta missing', 'low', 'Search engines may not have explicit directives.', 'No robots meta tag was found.', 'Add a robots meta tag when needed.'));

  const seoScore = scoreFromFindings(findings);

  stage('accessibility', 62, 'Running axe accessibility audit');
  let accessibilityState: any = { passes: [], violations: [], incomplete: [] };
  try {
    const browser = await chromium.launch({ headless: true });
    const pageAx = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await pageAx.goto(normalized, { waitUntil: 'networkidle', timeout: 45000 });
    const axe = await new AxeBuilder({ page: pageAx }).analyze();
    accessibilityState = {
      passes: axe.passes || [],
      violations: axe.violations || [],
      incomplete: axe.incomplete || [],
    };
    await browser.close();
  } catch (error) {
    console.warn('axe-core failed:', error);
  }
  const a11yFindings = (accessibilityState.violations || []).map((violation: any) => ({
    id: violation.id,
    impact: violation.impact || 'moderate',
    description: violation.description,
    help: violation.help,
    affectedNodes: violation.nodes?.length || 0,
    target: violation.nodes?.[0]?.target?.join(', ') || '',
  }));
  const impactMap: Record<string, number> = { serious: 30, critical: 35, moderate: 15, minor: 8 };
  let accessibilityPenalty = 0;
  for (const item of a11yFindings as Array<{ impact: string }>) {
    accessibilityPenalty += impactMap[item.impact] || 5;
  }
  const accessibilityScore = clampScore(100 - accessibilityPenalty);

  stage('security', 70, 'Checking response headers and security posture');
  const securityChecks = {
    https: responseStatus >= 200 && normalized.startsWith('https://') ? 'PASS' : 'FAIL',
    hsts: responseHeaders['strict-transport-security'] ? 'PASS' : 'NOT TESTABLE',
    csp: responseHeaders['content-security-policy'] ? 'PASS' : 'WARNING',
    xFrameOptions: responseHeaders['x-frame-options'] ? 'PASS' : 'WARNING',
    xContentTypeOptions: responseHeaders['x-content-type-options'] ? 'PASS' : 'WARNING',
    referrerPolicy: responseHeaders['referrer-policy'] ? 'PASS' : 'WARNING',
    permissionsPolicy: responseHeaders['permissions-policy'] ? 'PASS' : 'WARNING',
  };
  const securityFindings: any[] = [];
  if (!normalized.startsWith('https://')) securityFindings.push(buildFinding('HTTPS missing', 'high', 'The site is not served over HTTPS.', 'The URL protocol is HTTP.', 'Enable HTTPS and redirect HTTP to HTTPS.'));
  if (!responseHeaders['strict-transport-security']) securityFindings.push(buildFinding('HSTS missing', 'medium', 'HTTP Strict Transport Security is not present.', 'No strict-transport-security header was returned.', 'Add an HSTS header on the HTTPS endpoint.'));
  const securityScore = scoreFromFindings(securityFindings.length ? securityFindings : [{ severity: 'info' }]);

  stage('mobile', 78, 'Running mobile rendering review');
  let mobileReport: any = {
    viewport: { width: 375, height: 812 },
    responsiveFindings: [],
    layoutIssues: [],
    recommendations: [],
  };
  try {
    const browser = await chromium.launch({ headless: true });
    const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
    await mobilePage.goto(normalized, { waitUntil: 'networkidle', timeout: 45000 });
    const width = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    const overflowDetected = width > 375;
    mobileReport = {
      viewport: { width: 375, height: 812 },
      overflowDetected,
      responsiveFindings: overflowDetected ? [{ title: 'Horizontal overflow', severity: 'medium', description: 'The page exceeds the mobile viewport width.' }] : [],
      layoutIssues: overflowDetected ? ['Horizontal overflow detected'] : [],
      recommendations: overflowDetected ? ['Improve layout responsiveness and prevent wide fixed-width elements.'] : ['No obvious mobile overflow issue detected.'],
    };
    await browser.close();
  } catch (error) {
    console.warn('Mobile audit failed:', error);
  }
  const mobileScore = clampScore(100 - (mobileReport.responsiveFindings.length * 10));

  stage('technical', 84, 'Inspecting technical page details');
  const technicalFindings: any[] = [];
  if (responseStatus >= 400) technicalFindings.push(buildFinding(`HTTP ${responseStatus}`, 'high', 'The page returned an error response.', `Status code: ${responseStatus}.`, 'Investigate the server response and fix the cause of the failure.'));
  if (html.length === 0) technicalFindings.push(buildFinding('Empty HTML', 'high', 'The page produced no readable HTML.', 'The page content was empty or unavailable.', 'Confirm the page loads and returns a valid document.'));
  const resourceCount = (seoHtml.match(/<script|<link|<img/gi) || []).length;
  const technicalScore = scoreFromFindings(technicalFindings.length ? technicalFindings : [{ severity: 'info' }]);

  stage('scoring', 90, 'Calculating final scores');
  const finalPerformance = lighthouseReport.categories?.performance?.score ? Math.round(lighthouseReport.categories.performance.score * 100) : 0;
  const overallScore = Math.round(
    (finalPerformance * 0.25) +
      (seoScore * 0.2) +
      (accessibilityScore * 0.2) +
      (securityScore * 0.15) +
      (mobileScore * 0.1) +
      (technicalScore * 0.1),
  );

  stage('saving', 95, 'Saving the analysis and report');
  const analysis = {
    userId: '',
    websiteId: '',
    url: normalized,
    status: 'completed',
    overallScore,
    performance: {
      score: finalPerformance,
      metrics: {
        fcp: lighthouseReport.audits?.['first-contentful-paint']?.numericValue || null,
        lcp: lighthouseReport.audits?.['largest-contentful-paint']?.numericValue || null,
        cls: lighthouseReport.audits?.['cumulative-layout-shift']?.numericValue || null,
        tbt: lighthouseReport.audits?.['total-blocking-time']?.numericValue || null,
        si: lighthouseReport.audits?.['speed-index']?.numericValue || null,
      },
    },
    seo: {
      score: seoScore,
      findings,
      title,
      description: metaDesc,
      canonical,
      robotsMeta,
      h1Count,
    },
    accessibility: {
      score: accessibilityScore,
      violations: a11yFindings,
      passes: accessibilityState.passes?.length || 0,
      incomplete: accessibilityState.incomplete?.length || 0,
    },
    security: {
      score: securityScore,
      checks: securityChecks,
      findings: securityFindings,
    },
    mobile: {
      score: mobileScore,
      ...mobileReport,
    },
    technical: {
      score: technicalScore,
      status: responseStatus,
      finalUrl,
      redirectChain,
      headers: responseHeaders,
      htmlSize: seoHtml.length,
      resourceCount,
      findings: technicalFindings,
    },
    aiSummary: '',
    aiRecommendations: [],
    startedAt: new Date(),
    completedAt: new Date(),
    duration: 0,
    error: '',
    findings: findings.concat(securityFindings, technicalFindings, a11yFindings),
    reportData: {
      url: normalized,
      domain,
      favicon,
      overallScore,
    },
  };

  return { analysis, domain, favicon, normalized };
}
