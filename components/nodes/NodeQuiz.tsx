'use client'
import { useState, useEffect } from 'react'
import type { QuizNode } from '@/lib/types'
import BookmarkButton from '../ui/BookmarkButton'
import MetaBar from '../ui/MetaBar'
import ReferencesDrawer from '../ui/ReferencesDrawer'
import { quizComplete } from '@/lib/confetti'
import { MathJax } from 'better-react-mathjax'

export default function NodeQuiz({
  node, instant, bookmarked, onToggleBookmark
}: { node: QuizNode, instant: boolean, bookmarked: boolean, onToggleBookmark: ()=>void }) {
  const [picked, setPicked] = useState<Record<string, number>>({})
  const [checked, setChecked] = useState(false)
  const [showRefs, setShowRefs] = useState(false)
  const [celebrated, setCelebrated] = useState(false)

  function onPick(qid: string, idx: number) {
    const next = { ...picked, [qid]: idx }
    setPicked(next)
    if (instant) setChecked(true)
  }

  const total = node.questions.length
  const correct = node.questions.reduce((acc, q)=> acc + (picked[q.id] === q.answerIndex ? 1 : 0), 0)
  const score = total > 0 ? Math.round((correct / total) * 100) : 0

  // Trigger confetti when quiz is checked and score is calculated
  useEffect(() => {
    if (checked && !celebrated && Object.keys(picked).length === total) {
      quizComplete(score)
      setCelebrated(true)
    }
  }, [checked, score, total, celebrated, picked])

  // Reset celebration flag when quiz is reset
  useEffect(() => {
    if (!checked) {
      setCelebrated(false)
    }
  }, [checked])

  return (
    <section id={node.id} data-node-id={node.id} className="bg-gray-900 dark:bg-gray-950 p-6 rounded-2xl card border-t-4 border-emerald-500 shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-xl md:text-2xl font-bold text-emerald-400">{node.title || 'Quiz'}</h3>
        <div className="flex items-center gap-2">
          {node.meta?.refs?.length ? (
            <button onClick={()=>setShowRefs(true)} className="text-xs border px-2 py-1 rounded bg-emerald-900/30 text-emerald-300 border-emerald-700 hover:bg-emerald-800/40">References</button>
          ) : null}
          <BookmarkButton active={bookmarked} onToggle={onToggleBookmark} />
        </div>
      </div>
      <MetaBar meta={node.meta} />

      <div className="space-y-6 mt-3">
        {node.questions.map(q => {
          const user = picked[q.id]
          const isCorrect = checked && user === q.answerIndex
          const isWrong = checked && user !== undefined && user !== q.answerIndex
          return (
            <div key={q.id} className="p-4 bg-gray-800 rounded-lg shadow-md border-l-4 border-emerald-500">
              <p className="font-semibold text-lg text-gray-200 mb-3 whitespace-pre-wrap break-words min-w-0"><MathJax>Q. {q.prompt}</MathJax></p>
              <div className="space-y-2">
                {q.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center space-x-2 text-gray-300 hover:bg-gray-700 p-2 rounded-md cursor-pointer transition">
                    <input type="radio" name={`q-${q.id}`} checked={user===idx} onChange={()=>onPick(q.id, idx)} className="text-emerald-500 h-4 w-4 shrink-0"/>
                    <span className={`flex-1 ${checked ? (idx===q.answerIndex ? 'text-green-400 font-bold' : (user===idx ? 'text-red-400' : '')) : ''}`}><MathJax>{opt}</MathJax></span>
                  </label>
                ))}
              </div>
              {checked && (
                <div className={`mt-3 p-2 text-sm font-medium rounded ${isCorrect ? 'bg-green-900/40 text-green-300 border border-green-700' : isWrong ? 'bg-red-900/40 text-red-300 border border-red-700' : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700'}`}>
                  {isCorrect ? '✅ Correct!' : isWrong ? <>❌ Incorrect. Correct: <strong><MathJax>{q.options[q.answerIndex]}</MathJax></strong>{q.reason ? <> — <MathJax>{q.reason}</MathJax></> : null}</> : 'Select an option'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button onClick={()=>setChecked(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded">Submit</button>
        <button onClick={()=>{ setPicked({}); setChecked(false) }} className="border border-emerald-600 text-emerald-400 font-bold py-2 px-4 rounded bg-gray-800 hover:bg-gray-700">Reset</button>
        <button onClick={()=>{ const map: Record<string, number> = {}; node.questions.forEach(q=> map[q.id] = q.answerIndex); setPicked(map); setChecked(true) }} className="bg-emerald-900/40 text-emerald-300 font-bold py-2 px-4 rounded border border-emerald-700">Show Answers</button>
        {checked && <span className="ml-auto text-sm font-semibold text-gray-300">Score: {correct} / {total}</span>}
      </div>

      {node.meta?.refs?.length ? (
        <ReferencesDrawer open={showRefs} refs={node.meta.refs} onClose={()=>setShowRefs(false)} />
      ) : null}
    </section>
  )
}