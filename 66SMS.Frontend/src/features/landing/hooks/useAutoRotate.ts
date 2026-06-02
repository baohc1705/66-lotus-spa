import { useState, useEffect, useCallback } from 'react'

export function useAutoRotate(total: number, interval = 4000) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused || total <= 0) return

    const id = setInterval(() => {
      setCurrent(prev => (prev + 1) % total)
    }, interval)

    return () => clearInterval(id)
  }, [total, interval, isPaused])

  const pause = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])

  return { current, setCurrent, pause, resume }
}
