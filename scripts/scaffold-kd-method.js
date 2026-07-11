const fs = require('fs');
const path = require('path');

const KD_METHOD_DIR = path.join(process.cwd(), 'data', 'study-material');

const scaffoldData = [
  // GS TrickFunda
  { subject: 'gs-trickfunda', chapter: 'history', type: 'ancient-history' },
  { subject: 'gs-trickfunda', chapter: 'history', type: 'medieval-history' },
  { subject: 'gs-trickfunda', chapter: 'polity', type: 'fundamental-rights' },
  // Reasoning TrickFunda
  { subject: 'reasoning-trickfunda', chapter: 'coding-decoding', type: 'level-1' },
  { subject: 'reasoning-trickfunda', chapter: 'coding-decoding', type: 'level-2' },
  { subject: 'reasoning-trickfunda', chapter: 'blood-relation', type: 'level-1' },
  // Vocab TrickFunda
  { subject: 'vocab-trickfunda', chapter: 'synonyms-antonyms', type: 'set-1' },
  { subject: 'vocab-trickfunda', chapter: 'synonyms-antonyms', type: 'set-2' },
  { subject: 'vocab-trickfunda', chapter: 'idioms-phrases', type: 'set-1' },
];

const mockNotesMarkdown = (subject, chapter, type) => `# ${type.replace(/-/g, ' ').toUpperCase()}

Welcome to the **${chapter.replace(/-/g, ' ')}** module of **${subject.replace(/-/g, ' ')}**. 

This section will cover the fundamental tricks and concepts to solve problems quickly.

## Key Concepts
1. Concept 1
2. Concept 2
3. Concept 3
`;

const mockNoteBoxes = [
  {
    "id": "box1",
    "title": "Quick Tip",
    "content": "Always read the question carefully before applying the trick. \\( x^2 + y^2 = z^2 \\)",
    "type": "tip"
  }
];

const mockQuiz = [
  {
    "id": "q1",
    "prompt": "Sample question for this topic?",
    "prompt_hi": "इस विषय के लिए नमूना प्रश्न?",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "options_hi": [
      "विकल्प ए",
      "विकल्प बी",
      "विकल्प सी",
      "विकल्प डी"
    ],
    "answerIndex": 0,
    "reason": "Option A is correct because it applies the primary concept.",
    "reason_hi": "विकल्प ए सही है क्योंकि यह प्राथमिक अवधारणा को लागू करता है।"
  }
];

scaffoldData.forEach(({ subject, chapter, type }) => {
  const targetDir = path.join(KD_METHOD_DIR, subject, chapter, type);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
  }

  // Write notes.md
  fs.writeFileSync(
    path.join(targetDir, 'notes.md'), 
    mockNotesMarkdown(subject, chapter, type)
  );

  // Write noteboxes.json
  fs.writeFileSync(
    path.join(targetDir, 'noteboxes.json'), 
    JSON.stringify(mockNoteBoxes, null, 2)
  );

  // Write quiz-level-1.json
  fs.writeFileSync(
    path.join(targetDir, 'quiz-level-1.json'), 
    JSON.stringify(mockQuiz, null, 2)
  );

  // Write youtube.txt (placeholder url)
  fs.writeFileSync(
    path.join(targetDir, 'youtube.txt'), 
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ\n"
  );
});

console.log('Scaffolding complete!');
