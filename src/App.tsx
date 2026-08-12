import { useEffect, useState } from "react"
import { LayoutGroup, MotionConfig, motion } from "motion/react"
import { gallery, preloadGallery } from "./data/media"
import { MediaPreview } from "./components/MediaPreview/MediaPreview"
import "./App.css"

const morphTransition = {
  type: "spring" as const,
  stiffness: 340,
  damping: 34,
  mass: 0.85,
}

export default function App() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void preloadGallery().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function openAt(i: number) {
    if (!ready) return
    setIndex(i)
    setOpen(true)
  }

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
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
              {gallery.map((item, i) => {
                const isActive = open && index === i
                return (
                  <li key={item.id} className="tile">
                    <button
                      type="button"
                      className="tile__hit"
                      onClick={() => openAt(i)}
                      aria-label={`Open ${item.title}`}
                      disabled={!ready}
                    >
                      {/*
                        Unmount while open so Motion can morph this node into
                        the overlay image. Same `src` as the overlay is required
                        for a correct first-open morph.
                      */}
                      {!isActive ? (
                        <motion.img
                          layoutId={`photo-${item.id}`}
                          className="tile__img"
                          src={item.src}
                          alt=""
                          width={item.width}
                          height={item.height}
                          draggable={false}
                          style={{ borderRadius: 16 }}
                          transition={morphTransition}
                        />
                      ) : (
                        <div className="tile__placeholder" aria-hidden />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </main>
        </div>

        <MediaPreview
          items={gallery}
          index={index}
          open={open}
          onClose={() => setOpen(false)}
          onIndexChange={setIndex}
          morphTransition={morphTransition}
        />
      </LayoutGroup>
    </MotionConfig>
  )
}
