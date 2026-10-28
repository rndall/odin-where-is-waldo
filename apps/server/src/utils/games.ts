interface Target {
  x: number
  y: number
}
export const checkTarget = ({
  guess,
  target,
  allowance,
}: {
  target: Target
  guess: Target
  allowance: number
}) =>
  Math.abs(guess.x - target.x) <= allowance &&
  Math.abs(guess.y - target.y) <= allowance
