'use client'

import { useState, useEffect, useRef } from 'react'

const students = [
  { name: 'Priya Sharma', exam: 'UPSC CSE', rank: 'AIR 47', image: '👩‍🎓', quote: 'Notty helped me crack UPSC!', color: 'from-violet-500 to-purple-600' },
  { name: 'Rahul Verma', exam: 'SSC CGL', rank: 'Selected', image: '👨‍💼', quote: 'Best platform for SSC prep', color: 'from-cyan-500 to-blue-600' },
  { name: 'Sneha Patel', exam: 'IBPS PO', rank: 'Cleared', image: '👩‍💻', quote: 'Analytics helped me improve', color: 'from-emerald-500 to-teal-600' },
  { name: 'Amit Kumar', exam: 'RRB NTPC', rank: 'AIR 156', image: '👨‍🔧', quote: 'Spaced repetition works!', color: 'from-amber-500 to-orange-600' },
  { name: 'Divya Singh', exam: 'GATE CS', rank: 'AIR 89', image: '👩‍🔬', quote: 'Perfect for technical exams', color: 'from-pink-500 to-rose-600' },
  { name: 'Karan Mehta', exam: 'CAT', rank: '99.8%ile', image: '👨‍🎓', quote: 'Quizzes are game-changers', color: 'from-indigo-500 to-purple-600' },
  { name: 'Ananya Roy', exam: 'NEET', rank: 'AIR 234', image: '👩‍⚕️', quote: 'Medical prep made easy', color: 'from-violet-500 to-fuchsia-600' },
  { name: 'Rohan Das', exam: 'JEE Advanced', rank: 'AIR 567', image: '👨‍🚀', quote: 'Engineering dreams achieved', color: 'from-cyan-500 to-teal-600' },
  { name: 'Pooja Gupta', exam: 'Bank PO', rank: 'Selected', image: '👩‍💼', quote: 'Banking exams conquered', color: 'from-emerald-500 to-green-600' },
  { name: 'Vikram Joshi', exam: 'NDA', rank: 'Recommended', image: '👨‍✈️', quote: 'Defense dreams fulfilled', color: 'from-amber-500 to-red-600' }
]

export default function StudentCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % students.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  useEffect(() => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth / 3
      scrollRef.current.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth'
      })
    }
  }, [currentIndex])

  const handlePrev = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + students.length) % students.length)
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % students.length)
  }

  return (
    <div id="success-stories" className="relative py-16 overflow-hidden bg-gradient-to-b from-white via-violet-50/30 to-white dark:from-gray-900 dark:via-violet-950/10 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full text-sm font-bold mb-4">
            🎓 SUCCESS STORIES
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
            Join 10,000+ Successful Students
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Real students, real results, real success
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center hover:scale-110 transition-all border-2 border-violet-200 dark:border-violet-800"
            aria-label="Previous"
          >
            <span className="text-2xl">←</span>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center hover:scale-110 transition-all border-2 border-violet-200 dark:border-violet-800"
            aria-label="Next"
          >
            <span className="text-2xl">→</span>
          </button>

          {/* Carousel */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-12"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {students.map((student, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-full md:w-[calc(33.333%-1rem)] snap-center"
              >
                <div className={`relative bg-gradient-to-br ${student.color} p-8 rounded-3xl shadow-2xl hover:scale-105 transition-all h-full`}>
                  <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
                  <div className="relative z-10 text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl border-2 border-white/30">
                        {student.image}
                      </div>
                      <div>
                        <h3 className="font-black text-xl">{student.name}</h3>
                        <p className="text-sm opacity-90">{student.exam}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold border border-white/30">
                        {student.rank}
                      </div>
                    </div>
                    <p className="text-lg italic opacity-95">"{student.quote}"</p>
                    <div className="flex gap-1 mt-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-300 text-xl">⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {students.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsAutoPlaying(false)
                  setCurrentIndex(idx)
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 w-8'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
