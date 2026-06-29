// ============================================================================
// NOTTY TYPE DEFINITIONS - NEW HIERARCHICAL STRUCTURE
// Subject -> Topic -> SubTopic (recursive)
// ============================================================================

import type { BrandKey } from './brand'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed'

export type RefType = 'case' | 'article' | 'act' | 'doctrine' | 'book' | 'link'

export type Reference = {
  type?: RefType
  label: string
  url?: string
}

export type NodeMeta = {
  tags?: string[]
  difficulty?: Difficulty
  updatedAt?: string   // ISO date
  refs?: Reference[]
}

// ============================================================================
// CONTENT NODES (Building blocks for topic content)
// ============================================================================

export type BaseNode = {
  id: string
  kind: 'markdown' | 'flashcards'
  title?: string
  mnemonic?: string
  meta?: NodeMeta
}

export type MarkdownNode = BaseNode & {
  kind: 'markdown'
  body: string
}

export type Flashcard = {
  front: string
  back: string
  hint?: string
  mnemonic?: string
}

export type FlashcardsNode = BaseNode & {
  kind: 'flashcards'
  shuffle?: boolean
  cards: Flashcard[]
}

export type ContentNode = MarkdownNode | FlashcardsNode

// ============================================================================
// QUIZ QUESTIONS (Reusable across all levels)
// ============================================================================

export type QuizQuestion = {
  id: string
  prompt: string
  prompt_hi?: string
  options: string[]
  options_hi?: string[]
  answerIndex: number
  reason?: string
  reason_hi?: string
  examTag?: string
  meta?: NodeMeta
}

// ============================================================================
// TOPIC HIERARCHY (Recursive structure)
// ============================================================================

export type Topic = {
  id: string
  title: string
  description?: string
  brandColor?: BrandKey
  slug?: string
  
  // Content for THIS topic (optional - may only exist in leaf nodes)
  content?: ContentNode[]
  
  // Quiz questions for THIS topic (optional)
  quiz?: QuizQuestion[]
  
  // Nested sub-topics (recursive - unlimited depth)
  subTopics?: Topic[]
}

// ============================================================================
// SUBJECT (Top-level container)
// ============================================================================

export type Subject = {
  slug: string
  title: string
  description: string
  emoji?: string
  brandColor: BrandKey
  
  // Top-level topics
  topics: Topic[]
}

// ============================================================================
// LEGACY TYPES (for backward compatibility with existing components)
// ============================================================================

export type SectionNode = {
  id: string
  kind: 'section'
  title?: string
  mnemonic?: string
  children: Node[]
  meta?: NodeMeta
}

export type QuizNode = {
  id: string
  kind: 'quiz'
  title?: string
  questions: QuizQuestion[]
  meta?: NodeMeta
}

export type Node = SectionNode | MarkdownNode | FlashcardsNode | QuizNode

// ============================================================================
// NOTES SYSTEM TYPES
// ============================================================================

/**
 * Individual note with hierarchical context
 */
export type Note = {
  id: string
  content: string
  title?: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  topicId: string
  subtopicId?: string
  subjectSlug: string
}

/**
 * Path to locate a note in the hierarchy
 */
export type NotePath = {
  subjectSlug: string
  topicId?: string
  subtopicId?: string
}

/**
 * Subtopic notes container
 */
export type SubtopicNotes = {
  subtopicId: string
  notes: Note[]
}

/**
 * Topic notes container with subtopics
 */
export type TopicNotes = {
  topicId: string
  notes: Note[]
  subtopics: { [subtopicId: string]: SubtopicNotes }
}

/**
 * Complete subject notes structure
 */
export type SubjectNotes = {
  subjectSlug: string
  subjectName: string
  notes: Note[]
  topics: { [topicId: string]: TopicNotes }
  createdAt: string
  updatedAt: string
}

/**
 * Notes filter options
 */
export type NotesFilter = {
  tags?: string[]
  dateFrom?: string
  dateTo?: string
  searchQuery?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Notes statistics
 */
export type NotesStats = {
  total: number
  byLevel: {
    topic: number
    subtopic: number
  }
  recentlyUpdated: number
  last7Days: number
  last30Days: number
  bySubject: { [key: string]: number }
  topTags: Array<{ tag: string; count: number }>
  avgNotesPerDay: number
}

/**
 * Backup metadata
 */
export type BackupInfo = {
  timestamp: number
  date: string
  noteCount: number
}

// Re-export BrandKey for convenience
export type { BrandKey } from './brand'