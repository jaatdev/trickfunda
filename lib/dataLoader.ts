import fs from 'fs';
import path from 'path';

/**
 * Data Loader for new folder-based structure
 * Loads subjects/topics/subtopics from organized folders
 * SERVER-SIDE ONLY - uses Node.js fs module
 */

const SUBJECTS_DIR = path.join(process.cwd(), 'data', 'subjects');

// Cache for loaded data
let cachedData: any = null;

/**
 * Read JSON file
 */
function readJSON(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    // console.warn(`Could not read ${filePath}`);
    return null;
  }
}

/**
 * Scan a directory for all .json files and aggregate them
 */
function scanSubtopicDir(subTopicDir: string) {
  let subTopicData: any = null;
  let contentItems: any[] = [];
  let quizQuestions: any[] = [];

  try {
    if (fs.existsSync(subTopicDir)) {
      const files = fs.readdirSync(subTopicDir).filter(f => f.endsWith('.json'));
      
      for (const file of files) {
        const filePath = path.join(subTopicDir, file);
        const data = readJSON(filePath);
        if (!data) continue;

        const fileNameLower = file.toLowerCase();
        
        // Match quiz files (e.g. quiz.json, quiz-english.json, english.quiz.json)
        const isQuizFile = fileNameLower === 'quiz.json' || 
                           fileNameLower.startsWith('quiz-') || 
                           fileNameLower.endsWith('-quiz.json') || 
                           fileNameLower.includes('.quiz.json');
                           
        // Match content files
        const isContentFile = fileNameLower === 'content.json' || 
                              fileNameLower.startsWith('content-') || 
                              fileNameLower.includes('.content.json');
                              
        // Match flashcard files (e.g. flashcards.json, flashcards-english.json, english.flashcards.json)
        const isFlashcardFile = fileNameLower === 'flashcards.json' ||
                                fileNameLower.startsWith('flashcards-') ||
                                fileNameLower.endsWith('-flashcards.json') ||
                                fileNameLower.includes('.flashcards.json');
                              
        const isSubtopicFile = fileNameLower === 'subtopic.json';

        if (isQuizFile) {
          if (Array.isArray(data)) {
            quizQuestions = [...quizQuestions, ...data];
          } else if (data && Array.isArray(data.questions)) {
            quizQuestions = [...quizQuestions, ...data.questions];
          }
        } else if (isContentFile) {
          if (Array.isArray(data)) {
            contentItems = [...contentItems, ...data];
          } else if (data && Array.isArray(data.items)) {
            contentItems = [...contentItems, ...data.items];
          }
        } else if (isFlashcardFile) {
          // If flat array or object with flashcards
          let cards: any[] = [];
          if (Array.isArray(data)) {
            cards = data;
          } else if (data && Array.isArray(data.flashcards)) {
            cards = data.flashcards;
          }
          if (cards.length > 0) {
            contentItems.push({
              id: `flashcard-deck-${file}`,
              kind: 'flashcards',
              cards: cards
            });
          }
        } else if (isSubtopicFile) {
          subTopicData = { ...subTopicData, ...data };
        }
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Fallback if no subtopic meta was explicitly detected but we need it
  if (!subTopicData) {
     subTopicData = readJSON(path.join(subTopicDir, 'subtopic.json'));
  }

  return {
    ...subTopicData,
    content: contentItems,
    quiz: quizQuestions
  };
}

/**
 * Load all subjects with full nested structure
 * Caches result for performance
 */
export function loadAllSubjects() {
  // Return cached data if available
  if (cachedData) {
    return cachedData;
  }

  const indexPath = path.join(SUBJECTS_DIR, 'index.json');
  const index = readJSON(indexPath);

  if (!index || !index.subjects) {
    throw new Error('Invalid subjects index.json');
  }

  const subjects = index.subjects.map((subjectMeta: any) => {
    const subjectDir = path.join(SUBJECTS_DIR, subjectMeta.slug);
    const subjectData = readJSON(path.join(subjectDir, 'subject.json'));

    if (!subjectData) {
      console.warn(`Subject data missing for ${subjectMeta.slug}`);
      return null;
    }

    const topics = subjectData.topics.map((topicMeta: any) => {
      const topicDir = path.join(subjectDir, topicMeta.slug);
      const topicData = readJSON(path.join(topicDir, 'topic.json'));

      if (!topicData) {
        console.warn(`Topic data missing for ${topicMeta.slug}`);
        return null;
      }

      const subTopics = topicData.subTopics.map((subTopicMeta: any) => {
        const subTopicDir = path.join(topicDir, subTopicMeta.slug);
        
        // Dynamically parse JSONs in subTopicDir
        return scanSubtopicDir(subTopicDir);
      }).filter(Boolean);

      return {
        ...topicData,
        subTopics
      };
    }).filter(Boolean);

    return {
      ...subjectData,
      topics
    };
  }).filter(Boolean);

  const result = { subjects };
  
  // Cache the result
  cachedData = result;
  
  return result;
}

/**
 * Load specific subject
 */
export function loadSubject(slug: string) {
  const subjectDir = path.join(SUBJECTS_DIR, slug);
  const subjectData = readJSON(path.join(subjectDir, 'subject.json'));

  if (!subjectData) {
    return null;
  }

  const topics = subjectData.topics.map((topicMeta: any) => {
    const topicDir = path.join(subjectDir, topicMeta.slug);
    const topicData = readJSON(path.join(topicDir, 'topic.json'));

    if (!topicData) return null;

    const subTopics = topicData.subTopics.map((subTopicMeta: any) => {
      const subTopicDir = path.join(topicDir, subTopicMeta.slug);
      
      // Dynamically parse JSONs in subTopicDir
      return scanSubtopicDir(subTopicDir);
    }).filter(Boolean);

    return {
      ...topicData,
      subTopics
    };
  }).filter(Boolean);

  return {
    ...subjectData,
    topics
  };
}

/**
 * Load specific topic
 */
export function loadTopic(subjectSlug: string, topicSlug: string) {
  const topicDir = path.join(SUBJECTS_DIR, subjectSlug, topicSlug);
  const topicData = readJSON(path.join(topicDir, 'topic.json'));

  if (!topicData) {
    return null;
  }

  const subTopics = topicData.subTopics.map((subTopicMeta: any) => {
    const subTopicDir = path.join(topicDir, subTopicMeta.slug);
    
    // Dynamically parse JSONs in subTopicDir
    return scanSubtopicDir(subTopicDir);
  }).filter(Boolean);

  return {
    ...topicData,
    subTopics
  };
}

/**
 * Load specific subtopic
 */
export function loadSubTopic(subjectSlug: string, topicSlug: string, subTopicSlug: string) {
  const subTopicDir = path.join(SUBJECTS_DIR, subjectSlug, topicSlug, subTopicSlug);
  
  // Dynamically parse JSONs in subTopicDir
  const data = scanSubtopicDir(subTopicDir);
  if (!data || Object.keys(data).length <= 2) { // Just content & quiz empty arrays
      // Check if subtopic.json exists to be sure it's valid
      const explicitMeta = readJSON(path.join(subTopicDir, 'subtopic.json'));
      if (!explicitMeta && data.content.length === 0 && data.quiz.length === 0) {
          return null;
      }
  }
  return data;
}

/**
 * Get subjects list (metadata only)
 */
export function getSubjectsList() {
  const indexPath = path.join(SUBJECTS_DIR, 'index.json');
  const index = readJSON(indexPath);
  return index?.subjects || [];
}

/**
 * Get topics list for a subject (metadata only)
 */
export function getTopicsList(subjectSlug: string) {
  const subjectDir = path.join(SUBJECTS_DIR, subjectSlug);
  const subjectData = readJSON(path.join(subjectDir, 'subject.json'));
  return subjectData?.topics || [];
}

/**
 * Get subtopics list for a topic (metadata only)
 */
export function getSubTopicsList(subjectSlug: string, topicSlug: string) {
  const topicDir = path.join(SUBJECTS_DIR, subjectSlug, topicSlug);
  const topicData = readJSON(path.join(topicDir, 'topic.json'));
  return topicData?.subTopics || [];
}

// Export for backward compatibility (loads everything)
export function getAllData() {
  return loadAllSubjects();
}

