import type { Difficulty } from '@/lib/types'
const color: Record<Difficulty, string> = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hard: 'bg-red-100 text-red-800 border-red-200',
  mixed: 'bg-blue-100 text-blue-800 border-blue-200',
  expert: 'bg-purple-100 text-purple-800 border-purple-200',
}
export default function DifficultyBadge({ level }: { level?: Difficulty }) {
  if (!level) return null
  return <span className={`inline-block text-xs font-bold rounded-full px-2 py-0.5 mr-1 border ${color[level]}`}>{level}</span>
}