const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('app', (filePath) => {
  if (!filePath.endsWith('page.tsx') && !filePath.endsWith('layout.tsx')) return;
  if (filePath.includes('admin')) return; // Ignore admin routes
  if (filePath === path.normalize('app/page.tsx')) return; // Ignore home page
  if (filePath === path.normalize('app/layout.tsx')) return; // Ignore root layout

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // regex to remove top padding utility classes
  content = content.replace(/\bpt-\d+\b/g, '');
  content = content.replace(/\bmd:pt-\d+\b/g, '');
  content = content.replace(/\bsm:pt-\d+\b/g, '');
  content = content.replace(/\blg:pt-\d+\b/g, '');
  content = content.replace(/\bxl:pt-\d+\b/g, '');
  
  // handle pt-[120px]
  content = content.replace(/\bpt-\[\d+px\]\b/g, '');

  // clean up extra spaces inside className=" ... " ONLY
  content = content.replace(/className="([^"]+)"/g, (match, classes) => {
    return 'className="' + classes.replace(/\s+/g, ' ').trim() + '"';
  });
  
  // also handle template literals className={`...`}
  content = content.replace(/className=\{`([^`]+)`\}/g, (match, classes) => {
    // don't trim template literals because they might be part of an expression, just reduce multiple spaces
    return 'className={`' + classes.replace(/  +/g, ' ') + '`}';
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
});
console.log('Done');
