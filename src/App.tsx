import { useState } from "react"
import { LayoutGroup, MotionConfig, motion } from "motion/react"
import { gallery } from "./data/media"
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

  function openAt(i: number) {
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
            <p className="lede">Click a photo — it should morph into the preview.</p>

            <ul className="grid">
              {gallery.map((item, i) => {
                const isActive = open && index === i
                return (
                  <li key={item.id} className="tile">
                    <button
                      type="button"
                      className="tile__hit"
                      onClick={() => openAt(i)}
                      aria-label={`Open ${item.title}`}
                    >
                      {/*
                        Unmount the shared element while open so Motion can
                        morph between this node and the overlay image.
                      */}
                      {!isActive ? (
                        <motion.img
                          layoutId={`photo-${item.id}`}
                          className="tile__img"
                          src={item.thumb}
                          alt=""
                          width={item.width}
                          height={item.height}
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
