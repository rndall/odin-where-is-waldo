import { useEffect, useState } from "react"

const pad = (value: number) => String(value).padStart(2, "0")

interface TimerProps {
  startedAt: string
}
export default function Timer({ startedAt }: TimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const startMs = Date.parse(startedAt)
    const intervalId = setInterval(() => {
      setElapsed(Date.now() - startMs)
    }, 10)

    return () => clearInterval(intervalId)
  }, [startedAt])

  const totalHundredths = Math.floor(elapsed / 10)

  const hours = Math.floor(totalHundredths / 360000)
  const minutes = Math.floor(totalHundredths / 6000) % 60
  const seconds = Math.floor(totalHundredths / 100) % 60
  const hundredths = totalHundredths % 100

  const parts: string[] = []
  if (hours) parts.push(String(hours))
  if (hours || minutes) parts.push(String(minutes))
  parts.push(`${pad(seconds)}.${pad(hundredths)}`)

  return <p className="tabular-nums">{parts.join(":")}</p>
}
