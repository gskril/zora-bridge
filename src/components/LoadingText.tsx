import { useEffect, useState } from 'react'

export function LoadingText({ children }: { children: string }) {
  const [dots, setDots] = useState<string>('')
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((dots) => (dots.length >= 3 ? '' : dots + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <span>
      {children}
      {dots}
    </span>
  )
}
