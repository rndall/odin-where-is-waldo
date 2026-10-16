import { type ImgHTMLAttributes } from "react"

import { cn } from "@workspace/ui/lib/utils"

export function LevelImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      {...props}
      className={cn("mx-auto cursor-crosshair", props.className)}
    />
  )
}
