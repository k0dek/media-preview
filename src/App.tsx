import { useEffect, useState, type MouseEvent } from "react"
import { MotionConfig } from "motion/react"
import { gallery, preloadGallery } from "./data/media"
import { MediaPreview } from "./components/MediaPreview/MediaPreview"
import "./App.css"

export type OriginRect = {
  top: number
  left: number
  width: number
  height: number
}

function readTileRect(i: number): OriginRect | null {
  const btn = document.querySelectorAll<HTMLElement>(".tile__hit")[i]
  if (!btn) return null
  const r = btn.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

export default function App() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const [origin, setOrigin] = useState<OriginRect | null>(null)
  const [hiddenId, setHiddenId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void preloadGallery().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function openAt(i: number, event: MouseEvent<HTMLButtonElement>) {
    if (!ready) return
    const img = event.currentTarget.querySelector("img")
    const r = (img ?? event.currentTarget).getBoundingClientRect()
    setOrigin({ top: r.top, left: r.left, width: r.width, height: r.height })
    setIndex(i)
    setHiddenId(gallery[i].id)
    setOpen(true)
  }

  function handleClose() {
    const rect = readTileRect(index) ?? origin
    setOrigin(rect)
    setHiddenId(gallery[index]?.id ?? null)
    // Commit the exit target for one frame, then unmount so AnimatePresence can morph back.
    requestAnimationFrame(() => setOpen(false))
  }

  function handleIndexChange(next: number) {
    setIndex(next)
    setHiddenId(gallery[next]?.id ?? null)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="page">
        <header className="nav">
          <span className="brand">Lumen</span>
        </header>

        <main className="stage">
          <p className="lede">
            {ready
              ? "Click a photo — it should morph into the preview."
              : "Loading photos…"}
          </p>

          <ul className={`grid ${ready ? "grid--ready" : ""}`}>
            {gallery.map((item, i) => (
              <li key={item.id} className="tile">
                <button
                  type="button"
                  className="tile__hit"
                  onClick={(e) => openAt(i, e)}
                  aria-label={`Open ${item.title}`}
                  disabled={!ready}
                >
                  <img
                    className={`tile__img ${hiddenId === item.id ? "tile__img--hidden" : ""}`}
                    src={item.src}
                    alt=""
                    width={item.width}
                    height={item.height}
                    draggable={false}
                  />
                </button>
              </li>
            ))}
          </ul>
        </main>
      </div>

      <MediaPreview
        items={gallery}
        index={index}
        open={open}
        origin={origin}
        onClose={handleClose}
        onIndexChange={handleIndexChange}
        onExitComplete={() => setHiddenId(null)}
      />
    </MotionConfig>
  )
}
