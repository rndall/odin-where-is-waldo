import { useEffect, useState } from "react"

import type { Game } from "@workspace/shared"
import { formatElapsed } from "@/utils/timer"

interface TimerProps {
  startedAt: Game["startedAt"]
  elapsedMs?: Game["elapsedMs"]
}
export default function Timer({ startedAt, elapsedMs }: TimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const startMs = Date.parse(startedAt)
    const intervalId = setInterval(() => {
      setElapsed(Date.now() - startMs)
    }, 10)

    return () => clearInterval(intervalId)
  }, [startedAt])

  const time = elapsedMs ?? elapsed

  return <p className="tabular-nums">{formatElapsed(time)}s</p>
}
