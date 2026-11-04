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
