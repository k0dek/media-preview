export type MediaKind = "image" | "video"

export type MediaItem = {
  id: string
  kind: MediaKind
  /** Same URL for grid + overlay so layoutId morph never waits on a cold decode. */
  src: string
  width: number
  height: number
  title: string
  caption: string
  credit: string
}

/**
 * Four stills. Thumb and preview MUST share `src` — a different hi-res URL on
 * first open makes Motion measure an unloaded image and the morph only works
 * after the browser cache is warm (the classic “second click” bug).
 */
export const gallery: MediaItem[] = [
  {
    id: "dune-ridge",
    kind: "image",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    title: "Dune Ridge",
    caption: "Warm dunes folding into haze at golden hour.",
    credit: "Unsplash",
  },
  {
    id: "glass-tower",
    kind: "image",
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    title: "Glass Tower",
    caption: "Vertical city geometry with soft morning light.",
    credit: "Unsplash",
  },
  {
    id: "forest-path",
    kind: "image",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    title: "Forest Path",
    caption: "Moss greens and soft shafts of canopy light.",
    credit: "Unsplash",
  },
  {
    id: "harbor-fog",
    kind: "image",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
    width: 1600,
    height: 1067,
    title: "Harbor Fog",
    caption: "Low contrast water dissolving into mist.",
    credit: "Unsplash",
  },
]

export function preloadGallery(items: MediaItem[] = gallery) {
  return Promise.all(
    items.map(
      (item) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          img.decoding = "async"
          img.onload = () => resolve()
          img.onerror = () => resolve()
          img.src = item.src
        }),
    ),
  )
}
