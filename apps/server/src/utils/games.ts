import { and, db } from "@workspace/db"

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

export const checkLeaderboardQualification = async ({
  levelId,
  elapsedMs,
}: {
  levelId: number
  elapsedMs: number
}) => {
  const leaderboard = await db.orm.public.Game.where({
    levelId,
  })
    .where((g) =>
      and(
        g.finishedAt.isNotNull(),
        g.elapsedMs.isNotNull(),
        g.playerName.isNotNull()
      )
    )
    .orderBy((g) => g.elapsedMs.asc())
    .select("elapsedMs")
    .limit(10)
    .all()

  const timeToBeat = leaderboard[leaderboard.length - 1]?.elapsedMs

  return leaderboard.length < 10 || (!!timeToBeat && elapsedMs < timeToBeat)
}
