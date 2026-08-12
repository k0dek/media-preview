export type MediaKind = "image" | "video"

export type PreviewItem = {
  id: string
  kind: MediaKind
  src: string
  thumb: string
  poster?: string
  width: number
  height: number
  title: string
  caption: string
  credit: string
}

export type MediaPreviewProps = {
  items: PreviewItem[]
  index: number
  open: boolean
  onClose: () => void
  onIndexChange: (index: number) => void
}
