const fs = require('fs');
const path = require('path');

const wrappers = [
  'custom-quiz/CyberViewerWrapper.tsx',
  'themes/english/EnglishViewerWrapper.tsx',
  'themes/english-steampunk/ClockworkViewerWrapper.tsx',
  'themes/gs/HologramViewerWrapper.tsx',
  'themes/math/ConstructorViewerWrapper.tsx',
  'themes/reasoning/QuantumViewerWrapper.tsx',
  'themes/vocab/LexiconViewerWrapper.tsx'
];

for (const file of wrappers) {
  const fullPath = path.join('c:/Users/Kapil Chaudhary/Desktop/notty/components/kd-method', file);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace `[&_button]` with `[&_button:not([class*="quiz-status"])]`
  // Replace `[&_button:hover]` with `[&_button:not([class*="quiz-status"]):hover]`
  
  // We can just regex replace `\[&_button\]` and `\[&_button:hover\]`
  let newContent = content
    .replace(/\[&_button\]/g, '[&_button:not([class*="quiz-status"])]')
    .replace(/\[&_button:hover\]/g, '[&_button:not([class*="quiz-status"]):hover]');

  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent);
    console.log(`Updated ${file}`);
  }
}
