import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "motion/react"
import {
  IconChevron,
  IconClose,
  IconDownload,
  IconFullscreen,
  IconPlay,
  IconZoomIn,
  IconZoomOut,
} from "./icons"
import type { MediaPreviewProps } from "./types"
import "./MediaPreview.css"

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const DISMISS_Y = 120

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function MediaPreview({
  items,
  index,
  open,
  onClose,
  onIndexChange,
}: MediaPreviewProps) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [showUi, setShowUi] = useState(true)
  const [dragging, setDragging] = useState(false)
  const panOrigin = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const item = items[index]
  const count = items.length
  const isImage = item?.kind === "image"
  const canZoom = isImage && !reduceMotion

  const resetView = useCallback(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const go = useCallback(
    (next: number) => {
      if (!count) return
      const wrapped = ((next % count) + count) % count
      onIndexChange(wrapped)
      resetView()
    },
    [count, onIndexChange, resetView],
  )

  const zoomBy = useCallback(
    (delta: number) => {
      if (!canZoom) return
      setZoom((z) => {
        const next = clamp(Number((z + delta).toFixed(2)), MIN_ZOOM, MAX_ZOOM)
        if (next === 1) setOffset({ x: 0, y: 0 })
        return next
      })
    },
    [canZoom],
  )

  const toggleFullscreen = useCallback(async () => {
    const el = dialogRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.()
    } else {
      await document.exitFullscreen?.()
    }
  }, [])

  const download = useCallback(() => {
    if (!item) return
    const a = document.createElement("a")
    a.href = item.src
    a.download = `${item.id}.${item.kind === "video" ? "mp4" : "jpg"}`
    a.target = "_blank"
    a.rel = "noopener"
    a.click()
  }, [item])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoom > 1) {
          resetView()
          return
        }
        onClose()
      }
      if (e.key === "ArrowRight") go(index + 1)
      if (e.key === "ArrowLeft") go(index - 1)
      if (e.key === "+" || e.key === "=") zoomBy(0.35)
      if (e.key === "-" || e.key === "_") zoomBy(-0.35)
      if (e.key === "0") resetView()
      if (e.key === "f" || e.key === "F") void toggleFullscreen()
      if (e.key === "d" || e.key === "D") download()
      if (e.key === " " && item?.kind === "video") {
        e.preventDefault()
        const v = videoRef.current
        if (!v) return
        if (v.paused) void v.play()
        else v.pause()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [
    open,
    zoom,
    index,
    item,
    go,
    onClose,
    resetView,
    zoomBy,
    toggleFullscreen,
    download,
  ])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => dialogRef.current?.focus(), 30)
    return () => window.clearTimeout(t)
  }, [open, index])

  useEffect(() => {
    resetView()
    setShowUi(true)
  }, [index, resetView])

  const onWheel = (e: ReactWheelEvent) => {
    if (!canZoom) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.18 : 0.18
    zoomBy(delta)
  }

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!canZoom || zoom <= 1) return
    e.currentTarget.setPointerCapture(e.pointerId)
    panOrigin.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
    setDragging(true)
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!panOrigin.current) return
    const dx = e.clientX - panOrigin.current.x
    const dy = e.clientY - panOrigin.current.y
    setOffset({ x: panOrigin.current.ox + dx, y: panOrigin.current.oy + dy })
  }

  const onPointerUp = (e: ReactPointerEvent) => {
    if (panOrigin.current) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    panOrigin.current = null
    setDragging(false)
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (zoom > 1) return
    if (Math.abs(info.offset.y) > DISMISS_Y || Math.abs(info.velocity.y) > 800) {
      onClose()
      return
    }
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 600) {
      go(info.offset.x < 0 ? index + 1 : index - 1)
    }
  }

  if (!item) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dialogRef}
          className="mp"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
        >
          <motion.button
            type="button"
            className="mp__backdrop"
            aria-label="Close preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className={`mp__chrome ${showUi ? "mp__chrome--on" : ""}`}>
            <header className="mp__top">
              <div className="mp__meta">
                <p id={titleId} className="mp__title">
                  {item.title}
                </p>
                <p className="mp__caption">{item.caption}</p>
              </div>
              <div className="mp__actions">
                <span className="mp__counter" aria-live="polite">
                  {index + 1} <span>/</span> {count}
                </span>
                {canZoom && (
                  <>
                    <button type="button" className="mp__btn" onClick={() => zoomBy(-0.35)} aria-label="Zoom out">
                      <IconZoomOut />
                    </button>
                    <button type="button" className="mp__btn" onClick={() => zoomBy(0.35)} aria-label="Zoom in">
                      <IconZoomIn />
                    </button>
                  </>
                )}
                <button type="button" className="mp__btn" onClick={() => void toggleFullscreen()} aria-label="Fullscreen">
                  <IconFullscreen />
                </button>
                <button type="button" className="mp__btn" onClick={download} aria-label="Download">
                  <IconDownload />
                </button>
                <button type="button" className="mp__btn mp__btn--close" onClick={onClose} aria-label="Close">
                  <IconClose />
                </button>
              </div>
            </header>
          </div>

          <button
            type="button"
            className="mp__nav mp__nav--prev"
            aria-label="Previous"
            onClick={() => go(index - 1)}
          >
            <IconChevron className="mp__nav-icon mp__nav-icon--flip" />
          </button>
          <button
            type="button"
            className="mp__nav mp__nav--next"
            aria-label="Next"
            onClick={() => go(index + 1)}
          >
            <IconChevron />
          </button>

          <motion.div
            className="mp__stage"
            drag={zoom === 1 && !reduceMotion ? true : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.18}
            onDragEnd={onDragEnd}
            onClick={() => setShowUi((v) => !v)}
            onWheel={onWheel}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={item.id}
                className="mp__frame"
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.96, y: 12 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.98, y: -8 }
                }
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 34,
                  mass: 0.8,
                }}
              >
                {item.kind === "image" ? (
                  <motion.img
                    layoutId={`media-${item.id}`}
                    className="mp__media"
                    src={item.src}
                    alt={item.title}
                    width={item.width}
                    height={item.height}
                    draggable={false}
                    style={{
                      scale: zoom,
                      x: offset.x,
                      y: offset.y,
                      cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    onDoubleClick={() => {
                      if (!canZoom) return
                      if (zoom > 1) resetView()
                      else setZoom(2.2)
                    }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                  />
                ) : (
                  <motion.div layoutId={`media-${item.id}`} className="mp__video-wrap">
                    <video
                      ref={videoRef}
                      className="mp__media mp__media--video"
                      src={item.src}
                      poster={item.poster}
                      controls
                      playsInline
                      autoPlay
                    />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <footer className={`mp__thumbs ${showUi ? "mp__thumbs--on" : ""}`}>
            <div className="mp__thumbs-track" role="list">
              {items.map((thumb, i) => (
                <button
                  key={thumb.id}
                  type="button"
                  role="listitem"
                  className={`mp__thumb ${i === index ? "mp__thumb--active" : ""}`}
                  onClick={() => go(i)}
                  aria-label={`Go to ${thumb.title}`}
                  aria-current={i === index}
                >
                  <img src={thumb.thumb} alt="" />
                  {thumb.kind === "video" && (
                    <span className="mp__thumb-badge" aria-hidden>
                      <IconPlay size={12} />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="mp__credit">{item.credit}</p>
          </footer>

          <p className="mp__hint">
            Esc close · ← → navigate · scroll zoom · drag dismiss · F fullscreen · D download
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
