import { Trophy } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import type { Leaderboard } from "@workspace/shared"
import { formatElapsed } from "@/utils/timer"

interface LeaderboardTableProps {
  leaderboardEntries: Leaderboard[]
}

export default function LeaderboardTable({
  leaderboardEntries,
}: LeaderboardTableProps) {
  if (!leaderboardEntries.length) {
    return <EmptyLeaderboard />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Player</TableHead>
          <TableHead>Time</TableHead>
          <TableHead className="text-right">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboardEntries.map((entry, i) => (
          <TableRow key={i}>
            <TableCell>{i + 1}</TableCell>
            <TableCell>{entry.playerName}</TableCell>
            <TableCell>{formatElapsed(entry.elapsedMs)}s</TableCell>
            <TableCell className="text-right">
              {new Date(entry.finishedAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function EmptyLeaderboard() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Trophy />
        </EmptyMedia>
        <EmptyTitle>No times yet</EmptyTitle>
        <EmptyDescription>
          Be the first to finish a level and claim rank 1.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
