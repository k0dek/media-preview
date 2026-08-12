export type MediaKind = "image" | "video"

export type MediaItem = {
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

/** Four stills — enough to test shared-element morph cleanly. */
export const gallery: MediaItem[] = [
  {
    id: "dune-ridge",
    kind: "image",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=80",
    thumb:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=75",
    width: 2400,
    height: 1600,
    title: "Dune Ridge",
    caption: "Warm dunes folding into haze at golden hour.",
    credit: "Unsplash",
  },
  {
    id: "glass-tower",
    kind: "image",
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=80",
    thumb:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=75",
    width: 2400,
    height: 1600,
    title: "Glass Tower",
    caption: "Vertical city geometry with soft morning light.",
    credit: "Unsplash",
  },
  {
    id: "forest-path",
    kind: "image",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=80",
    thumb:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=75",
    width: 2400,
    height: 1600,
    title: "Forest Path",
    caption: "Moss greens and soft shafts of canopy light.",
    credit: "Unsplash",
  },
  {
    id: "harbor-fog",
    kind: "image",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=80",
    thumb:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=75",
    width: 2400,
    height: 1600,
    title: "Harbor Fog",
    caption: "Low contrast water dissolving into mist.",
    credit: "Unsplash",
  },
]
