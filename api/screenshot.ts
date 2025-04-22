import type { VercelRequest, VercelResponse } from '@vercel/node';

// Dynamic Puppeteer import for local/prod
let puppeteerPkg: any, executablePath: string | undefined, args: string[] = [], headless = true;
async function getPuppeteer() {
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    // Vercel/AWS Lambda
    const chromium = await import('chrome-aws-lambda');
    puppeteerPkg = await import('puppeteer-core');
    executablePath = await chromium.executablePath;
    args = chromium.args;
    headless = chromium.headless;
  } else {
    puppeteerPkg = await import('puppeteer');
    executablePath = undefined;
    args = ['--no-sandbox', '--disable-setuid-sandbox'];
    headless = true;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.query.url || req.body?.url;
  const keyword = req.query.keyword || req.body?.keyword;
  const deviceType = req.query.deviceType || req.body?.deviceType || 'desktop';

  if (!url || !keyword) {
    return res.status(400).json({ error: 'Missing url or keyword' });
  }

  let browser = null;
  try {
    await getPuppeteer();
    browser = await puppeteerPkg.launch({
      args,
      defaultViewport: deviceType === 'mobile'
        ? { width: 400, height: 800, isMobile: true }
        : { width: 1200, height: 800 },
      executablePath,
      headless,
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Highlight the first occurrence of the keyword
    const result = await page.evaluate((keyword) => {
      function findAndHighlight(root, keyword) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        let node;
        let found = false;
        let element = null;
        while ((node = walker.nextNode())) {
          if (node.nodeValue && node.nodeValue.toLowerCase().includes(keyword.toLowerCase())) {
            // Highlight: wrap first occurrence in <mark>
            const idx = node.nodeValue.toLowerCase().indexOf(keyword.toLowerCase());
            const span = document.createElement('mark');
            span.style.background = 'yellow';
            span.textContent = node.nodeValue.substr(idx, keyword.length);
            const after = node.splitText(idx);
            after.nodeValue = after.nodeValue.substr(keyword.length);
            node.parentNode.insertBefore(span, after);
            found = true;
            element = span;
            break;
          }
        }
        if (!found) return { depth: 100, found: false };
        // Calculate depth (percentage scroll)
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const documentHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        const depth = Math.round((elementTop / documentHeight) * 100);
        window.scrollTo({ top: elementTop - 100, behavior: 'instant' });
        return { depth: Math.min(Math.max(depth, 0), 100), found: true };
      }
      return findAndHighlight(document.body, keyword);
    }, keyword);

    await page.waitForTimeout(500);
    const screenshotBuffer = await page.screenshot({ type: 'webp', fullPage: false });

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      screenshot: screenshotBuffer.toString('base64'),
      scrollDepth: result.depth,
      found: result.found,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || String(error) });
  } finally {
    if (browser) await browser.close();
  }
}
