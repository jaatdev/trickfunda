const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Make sure your Next.js dev server is running on localhost:3000
const BASE_URL = 'http://localhost:3000/render-pdf';

const DATA_DIRS = [
  path.join(process.cwd(), 'data', 'study-material'),
  path.join(process.cwd(), 'data', 'vocab-trickfunda')
];

async function findAndGenerate(dirPath, browser) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      await findAndGenerate(fullPath, browser);
    } else if (entry.isFile() && entry.name.startsWith('flashcards-') && entry.name.endsWith('.json')) {
      const outputName = entry.name.replace('.json', '.pdf');
      const outputPath = path.join(dirPath, outputName);
      
      const titleMatch = entry.name.replace('flashcards-', '').replace('.json', '');
      const title = titleMatch.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      // Relative path from project root for the Next.js API
      const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
      
      console.log(`Generating PDF for ${entry.name}...`);
      
      const page = await browser.newPage();
      
      try {
        const url = `${BASE_URL}?file=${encodeURIComponent(relativePath)}&title=${encodeURIComponent(title)}`;
        
        // Wait until network is idle to ensure Tailwind CSS and fonts are loaded
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Generate PDF
        await page.pdf({
          path: outputPath,
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            bottom: '20mm',
            left: '10mm',
            right: '10mm'
          }
        });
        
      } catch (err) {
        console.error(`Error generating PDF for ${entry.name}:`, err.message);
      } finally {
        await page.close();
      }
    }
  }
}

async function main() {
  console.log('🔨 Starting Headless Browser for PDF Generation...');
  console.log('⚠️  Ensure your local server (npm run dev) is running on port 3000!');
  
  let browser;
  try {
    // Try to find local Chrome or Edge to avoid puppeteer download issues on Windows
    const executablePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    
    let executablePath;
    for (const p of executablePaths) {
      if (fs.existsSync(p)) {
        executablePath = p;
        break;
      }
    }

    browser = await puppeteer.launch({ 
      headless: 'new',
      executablePath: executablePath // Will be undefined if not found, falling back to puppeteer's downloaded chrome
    });
    
    for (const dir of DATA_DIRS) {
      await findAndGenerate(dir, browser);
    }
    
    console.log('✅ Finished building Flashcard Static PDFs!');
  } catch (error) {
    console.error('Failed to run PDF generation:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main().catch(console.error);
