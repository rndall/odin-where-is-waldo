import { getRouteApi } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { Game } from "@workspace/shared"

import LeaderboardTable from "./leaderboard-table"

interface LeaderboardProps {
  levelNumber: NonNullable<Game["level"]>["number"]
}

const route = getRouteApi("/games/$gameId")

export default function Leaderboard({ levelNumber }: LeaderboardProps) {
  const context = route.useRouteContext()
  const { data } = useSuspenseQuery(
    context.levelLeaderboardQueryOptions(levelNumber)
  )

  return (
    <Card id="leaderboard" className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">
          <a
            href="#leaderboard"
            onClick={(e) => {
              e.preventDefault()
              document
                .getElementById("leaderboard")
                ?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            Level {levelNumber} Leaderboard
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LeaderboardTable leaderboardEntries={data} />
      </CardContent>
    </Card>
  )
}
