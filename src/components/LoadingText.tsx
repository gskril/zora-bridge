import { useEffect, useState } from 'react'

export function LoadingText({
  children,
  loading = true,
}: {
  children: string
  loading?: boolean
}) {
  const [dots, setDots] = useState<string>('.')
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((dots) => (dots.length >= 3 ? '' : dots + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <span>
      {children}
      {loading && dots}
    </span>
  )
}
