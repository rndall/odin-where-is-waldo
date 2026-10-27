import type { ImgHTMLAttributes, RefAttributes } from "react"

import { cn } from "@workspace/ui/lib/utils"

export default function LevelImage(
  props: ImgHTMLAttributes<HTMLImageElement> & RefAttributes<HTMLImageElement>
) {
  return (
    <img
      {...props}
      className={cn(
        "mx-auto block max-w-full cursor-crosshair",
        props.className
      )}
    />
  )
}
