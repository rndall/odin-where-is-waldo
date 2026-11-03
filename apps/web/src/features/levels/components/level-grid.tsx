import { useNavigate } from "@tanstack/react-router"

import { Avatar, AvatarImage } from "@workspace/ui/components/avatar"
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@workspace/ui/components/item"
import type { Level } from "@workspace/shared"

import { useStartGameMutation } from "@/features/games/hooks/useStartGameMutation"

interface LevelGridProps {
  levels: Level[]
}
export default function LevelGrid({ levels }: LevelGridProps) {
  const navigate = useNavigate()
  const { mutate: startGame } = useStartGameMutation()

  return (
    <ItemGroup className="grid grid-cols-3 gap-4">
      {levels.map((level) => (
        <Item
          key={level.id}
          className="shadow-muted/50 transition hover:-translate-y-2 hover:shadow"
          onClick={() =>
            startGame(
              { levelNumber: level.number },
              {
                onSuccess: ({ gameId }) => {
                  navigate({ to: "/games/$gameId", params: { gameId } })
                },
              }
            )
          }
          render={<button />}
        >
          <ItemHeader>
            <img
              className="w-full rounded-sm object-cover"
              src={`${import.meta.env.VITE_ASSET_BASE_URL}${level.imagePath}`}
            />
          </ItemHeader>
          <ItemContent className="flex-row items-center justify-between">
            <ItemTitle className="text-lg">Level {level.number}</ItemTitle>
            <ul className="flex gap-2">
              {level.targets.map((target) => (
                <li key={target.id}>
                  <Avatar>
                    <AvatarImage
                      src={`${import.meta.env.VITE_ASSET_BASE_URL}${target.imagePath}`}
                    />
                  </Avatar>
                </li>
              ))}
            </ul>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}
