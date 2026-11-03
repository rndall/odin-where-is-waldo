import { useNavigate } from "@tanstack/react-router"
import { useStartGameMutation } from "@/features/games/hooks/useStartGameMutation"

export function useStartGame() {
  const navigate = useNavigate()
  const { mutate } = useStartGameMutation()

  return (levelNumber: number) =>
    mutate(
      { levelNumber },
      {
        onSuccess: ({ gameId }) => {
          navigate({ to: "/games/$gameId", params: { gameId } })
        },
      }
    )
}
