const fs = require('fs');
const path = require('path');

const wrappers = [
  {
    file: 'custom-quiz/CyberViewerWrapper.tsx',
    colors: {
      answered: 'cyan-400',
      marked: 'fuchsia-400',
      skipped: 'rose-500',
      unanswered: 'slate-500'
    }
  },
  {
    file: 'themes/english/EnglishViewerWrapper.tsx',
    colors: {
      answered: 'emerald-600',
      marked: 'amber-500',
      skipped: 'rose-600',
      unanswered: 'stone-500'
    }
  },
  {
    file: 'themes/english-steampunk/ClockworkViewerWrapper.tsx',
    colors: {
      answered: 'emerald-600',
      marked: 'amber-500',
      skipped: 'rose-600',
      unanswered: 'stone-500'
    }
  },
  {
    file: 'themes/gs/HologramViewerWrapper.tsx',
    colors: {
      answered: 'cyan-400',
      marked: 'fuchsia-400',
      skipped: 'rose-500',
      unanswered: 'slate-400'
    }
  },
  {
    file: 'themes/math/ConstructorViewerWrapper.tsx',
    colors: {
      answered: 'blue-500',
      marked: 'amber-400',
      skipped: 'red-500',
      unanswered: 'slate-400'
    }
  },
  {
    file: 'themes/reasoning/QuantumViewerWrapper.tsx',
    colors: {
      answered: 'cyan-400',
      marked: 'fuchsia-400',
      skipped: 'rose-500',
      unanswered: 'slate-400'
    }
  },
  {
    file: 'themes/vocab/LexiconViewerWrapper.tsx',
    colors: {
      answered: 'emerald-500',
      marked: 'amber-400',
      skipped: 'rose-500',
      unanswered: 'stone-400'
    }
  }
];

for (const wrapper of wrappers) {
  const fullPath = path.join('c:/Users/Kapil Chaudhary/Desktop/notty/components/study-material', wrapper.file);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Ensure we don't add it multiple times
  if (!content.includes('quiz-status-answered')) {
    const rules = `
      [&_.quiz-status-answered]:!bg-${wrapper.colors.answered}/20 [&_.quiz-status-answered]:!border-${wrapper.colors.answered} [&_.quiz-status-answered]:!text-${wrapper.colors.answered}
      [&_.quiz-status-marked]:!bg-${wrapper.colors.marked}/20 [&_.quiz-status-marked]:!border-${wrapper.colors.marked} [&_.quiz-status-marked]:!text-${wrapper.colors.marked}
      [&_.quiz-status-skipped]:!bg-${wrapper.colors.skipped}/20 [&_.quiz-status-skipped]:!border-${wrapper.colors.skipped} [&_.quiz-status-skipped]:!text-${wrapper.colors.skipped}
      [&_.quiz-status-unanswered]:!bg-${wrapper.colors.unanswered}/20 [&_.quiz-status-unanswered]:!border-${wrapper.colors.unanswered} [&_.quiz-status-unanswered]:!text-${wrapper.colors.unanswered}
    `;
    
    // Fix regex to match any of `<Concept`, `<div`, `{children}`
    content = content.replace(/\s*">\s*(<(?:ConceptInteractiveViewer|div)|\{children\})/, (match, p1) => {
      return rules + '    ">\n      ' + p1;
    });

    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${wrapper.file}`);
  }
}
