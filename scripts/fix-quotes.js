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
  const fullPath = path.join('c:/Users/Kapil Chaudhary/Desktop/notty/components/study-material', file);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace double quotes with single quotes inside the attribute selector
  let newContent = content.replace(/\[class\*="quiz-status"\]/g, "[class*='quiz-status']");

  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent);
    console.log(`Fixed quotes in ${file}`);
  }
}
