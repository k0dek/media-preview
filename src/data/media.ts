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

/** Curated demo set — Unsplash stills + public sample video. */
export const gallery: MediaItem[] = [
  {
    id: "dune-ridge",
    kind: "image",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=80",
    thumb:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=70",
    width: 2400,
    height: 1600,
    title: "Dune Ridge",
    caption: "Warm dunes folding into haze at golden hour.",
    credit: "Unsplash / Kenrick Mills",
  },
  {
    id: "glass-tower",
    kind: "image",
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=80",
    thumb:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=70",
    width: 2400,
    height: 1600,
    title: "Glass Tower",
    caption: "Vertical city geometry with soft morning bounce light.",
    credit: "Unsplash / Pedro Lastra",
  },
  {
    id: "coast-film",
    kind: "video",
    src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumb:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=70",
    poster:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=75",
    width: 1920,
    height: 1080,
    title: "Coast Film",
    caption: "Sample motion clip — play, pause, scrub with native controls.",
    credit: "Google sample / Unsplash still",
  },
  {
    id: "studio-still",
    kind: "image",
    src: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=2400&q=80",
    thumb:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=70",
    width: 2400,
    height: 1600,
    title: "Studio Still",
    caption: "Quiet product lighting with deep shadow falloff.",
    credit: "Unsplash / Paul Skorupskas",
  },
  {
    id: "night-drive",
    kind: "video",
    src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumb:
      "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=800&q=70",
    poster:
      "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1600&q=75",
    width: 1920,
    height: 1080,
    title: "Night Drive",
    caption: "Second video slide — swipe between stills and motion.",
    credit: "Google sample / Unsplash still",
  },
  {
    id: "forest-path",
    kind: "image",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=80",
    thumb:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=70",
    width: 2400,
    height: 1600,
    title: "Forest Path",
    caption: "Moss greens and soft shafts of canopy light.",
    credit: "Unsplash / Lukasz Szmigiel",
  },
  {
    id: "concrete-curve",
    kind: "image",
    src: "https://images.unsplash.com/photo-1511818966892-d7d671e672a1?auto=format&fit=crop&w=2400&q=80",
    thumb:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a1?auto=format&fit=crop&w=800&q=70",
    width: 2400,
    height: 1600,
    title: "Concrete Curve",
    caption: "Brutalist ribbon with a single warm accent.",
    credit: "Unsplash / Lance Anderson",
  },
  {
    id: "harbor-fog",
    kind: "image",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=80",
    thumb:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=70",
    width: 2400,
    height: 1600,
    title: "Harbor Fog",
    caption: "Low contrast water, boats dissolving into mist.",
    credit: "Unsplash / Piotr Chrobot",
  },
]
