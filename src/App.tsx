import { useState } from "react"
import { LayoutGroup, motion } from "motion/react"
import { gallery } from "./data/media"
import { MediaPreview } from "./components/MediaPreview/MediaPreview"
import "./App.css"

export default function App() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  function openAt(i: number) {
    setIndex(i)
    setOpen(true)
  }

  return (
    <LayoutGroup>
      <div className="page">
        <div className="page__glow" aria-hidden />
        <div className="page__grain" aria-hidden />

        <header className="nav">
          <a className="brand" href="/" aria-label="Lumen home">
            <span className="brand__mark" aria-hidden />
            Lumen
          </a>
          <p className="nav__note">Motion · shared element · multi-media</p>
        </header>

        <main>
          <section className="hero">
            <h1 className="hero__brand">Lumen</h1>
            <p className="hero__lede">
              A media previewer with Emil-style Motion craft — open from the
              thumbnail, swipe the gallery, zoom images, play video, keep every
              control within reach.
            </p>
            <div className="hero__cta">
              <button type="button" className="btn" onClick={() => openAt(0)}>
                Open gallery
              </button>
              <a className="btn btn--ghost" href="#gallery">
                Browse stills
              </a>
            </div>
          </section>

          <section className="gallery" id="gallery">
            <div className="gallery__head">
              <h2>Library</h2>
              <p>Images and video in one overlay. Click any tile.</p>
            </div>

            <ul className="grid">
              {gallery.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="tile"
                    onClick={() => openAt(i)}
                    aria-label={`Open ${item.title}`}
                  >
                    <motion.img
                      layoutId={`media-${item.id}`}
                      className="tile__img"
                      src={item.thumb}
                      alt=""
                      width={item.width}
                      height={item.height}
                      loading="lazy"
                    />
                    <span className="tile__shade" />
                    <span className="tile__copy">
                      <span className="tile__kind">{item.kind}</span>
                      <span className="tile__title">{item.title}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="features">
            <h2>Controls</h2>
            <ul>
              <li>
                <strong>Shared-element open</strong>
                <span>Motion layoutId morph from thumbnail to stage</span>
              </li>
              <li>
                <strong>Gallery nav</strong>
                <span>Arrows, keyboard, thumbnails, swipe between slides</span>
              </li>
              <li>
                <strong>Image zoom</strong>
                <span>Wheel, double-click, buttons, pan while zoomed</span>
              </li>
              <li>
                <strong>Video</strong>
                <span>Native controls, Space play/pause, posters</span>
              </li>
              <li>
                <strong>Chrome</strong>
                <span>Counter, captions, fullscreen, download, drag dismiss</span>
              </li>
              <li>
                <strong>Accessibility</strong>
                <span>Dialog semantics, focus, reduced-motion paths</span>
              </li>
            </ul>
          </section>
        </main>

        <footer className="foot">
          <p>
            Built with <code>motion</code> following Emil Kowalski’s animation
            recommendations — springs for morphs, ease-out for overlays, no
            decorative motion noise.
          </p>
        </footer>
      </div>

      <MediaPreview
        items={gallery}
        index={index}
        open={open}
        onClose={() => setOpen(false)}
        onIndexChange={setIndex}
      />
    </LayoutGroup>
  )
}
