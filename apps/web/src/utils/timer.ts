const pad = (value: number) => String(value).padStart(2, "0")

export const formatElapsed = (elapsedMs: number) => {
  const totalHundredths = Math.floor(elapsedMs / 10)
  const hours = Math.floor(totalHundredths / 360000)
  const minutes = Math.floor(totalHundredths / 6000) % 60
  const seconds = Math.floor(totalHundredths / 100) % 60
  const hundredths = totalHundredths % 100

  const parts: string[] = []
  if (hours) parts.push(String(hours))
  if (hours || minutes) parts.push(String(minutes))
  parts.push(`${String(seconds)}.${pad(hundredths)}`)
  return parts.join(":")
}
