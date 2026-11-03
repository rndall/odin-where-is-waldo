import { useForm } from "@tanstack/react-form"
import { getRouteApi } from "@tanstack/react-router"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { GameSetPlayerNameBodySchema } from "@workspace/shared"
import { useSetPlayerNameMutation } from "@/features/games/hooks/useSetPlayerNameMutation"
import { toast } from "@workspace/ui/components/toast"

const route = getRouteApi("/games/$gameId")

export default function PlayerNameForm({
  onSuccess,
}: {
  onSuccess: () => void
}) {
  const { mutate, isPending } = useSetPlayerNameMutation()
  const { gameId } = route.useParams()

  const form = useForm({
    defaultValues: {
      playerName: "",
    },
    validators: {
      onSubmit: GameSetPlayerNameBodySchema,
    },
    onSubmit: async ({ value }) => {
      mutate(
        { gameId, body: value },
        {
          onSuccess: () => {
            onSuccess()
            toast.add({
              type: "success",
              title: "Time saved",
            })
          },
        }
      )
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.Field
          name="playerName"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Player Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <Button type="submit" disabled={isPending}>
          Save Time
          {isPending && <Spinner data-icon="inline-end" />}
        </Button>
      </FieldGroup>
    </form>
  )
}
