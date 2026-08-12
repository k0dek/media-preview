export type MediaKind = "image" | "video"

export type PreviewItem = {
  id: string
  kind: MediaKind
  src: string
  width: number
  height: number
  title: string
  caption: string
  credit: string
}

export type OriginRect = {
  top: number
  left: number
  width: number
  height: number
}

export type MediaPreviewProps = {
  items: PreviewItem[]
  index: number
  open: boolean
  origin: OriginRect | null
  onClose: () => void
  onIndexChange: (index: number) => void
  onExitComplete?: () => void
}
