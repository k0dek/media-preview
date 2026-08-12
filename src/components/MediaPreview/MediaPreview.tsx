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
  IconZoomIn,
  IconZoomOut,
} from "./icons"
import type { MediaPreviewProps } from "./types"
import "./MediaPreview.css"

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const DISMISS_Y = 110

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function MediaPreview({
  items,
  index,
  open,
  onClose,
  onIndexChange,
  morphTransition,
}: MediaPreviewProps) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  /** Gestures/zoom only after shared-element morph finishes — avoids off-center residue. */
  const [gesturesOn, setGesturesOn] = useState(false)
  const panOrigin = useRef<{
    x: number
    y: number
    ox: number
    oy: number
  } | null>(null)

  const item = items[index]
  const count = items.length
  const canZoom = !!item && item.kind === "image" && !reduceMotion
  const isZoomed = zoom > 1

  const resetView = useCallback(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const requestClose = useCallback(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setGesturesOn(false)
    // Commit identity transforms for one frame, then hand layoutId back to the grid.
    requestAnimationFrame(() => onClose())
  }, [onClose])

  const go = useCallback(
    (next: number) => {
      if (!count) return
      setZoom(1)
      setOffset({ x: 0, y: 0 })
      setGesturesOn(false)
      onIndexChange(((next % count) + count) % count)
    },
    [count, onIndexChange],
  )

  const zoomBy = useCallback(
    (delta: number) => {
      if (!canZoom || !gesturesOn) return
      setZoom((z) => {
        const next = clamp(Number((z + delta).toFixed(2)), MIN_ZOOM, MAX_ZOOM)
        if (next === 1) setOffset({ x: 0, y: 0 })
        return next
      })
    },
    [canZoom, gesturesOn],
  )

  const toggleFullscreen = useCallback(async () => {
    const el = rootRef.current
    if (!el) return
    if (!document.fullscreenElement) await el.requestFullscreen?.()
    else await document.exitFullscreen?.()
  }, [])

  const download = useCallback(() => {
    if (!item) return
    const a = document.createElement("a")
    a.href = item.src
    a.download = `${item.id}.jpg`
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
    if (!open) {
      setZoom(1)
      setOffset({ x: 0, y: 0 })
      setGesturesOn(false)
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
        requestClose()
      }
      if (e.key === "ArrowRight") go(index + 1)
      if (e.key === "ArrowLeft") go(index - 1)
      if (e.key === "+" || e.key === "=") zoomBy(0.35)
      if (e.key === "-" || e.key === "_") zoomBy(-0.35)
      if (e.key === "0") resetView()
      if (e.key === "f" || e.key === "F") void toggleFullscreen()
      if (e.key === "d" || e.key === "D") download()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [
    open,
    zoom,
    index,
    go,
    requestClose,
    resetView,
    zoomBy,
    toggleFullscreen,
    download,
  ])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => rootRef.current?.focus(), 20)
    return () => window.clearTimeout(t)
  }, [open, index])

  // Fallback if layout animation complete never fires (reduced motion / interrupted).
  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => setGesturesOn(true), reduceMotion ? 0 : 650)
    return () => window.clearTimeout(t)
  }, [open, index, reduceMotion])

  const onWheel = (e: ReactWheelEvent) => {
    if (!canZoom || !gesturesOn) return
    e.preventDefault()
    zoomBy(e.deltaY > 0 ? -0.18 : 0.18)
  }

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!canZoom || !gesturesOn || zoom <= 1) return
    e.currentTarget.setPointerCapture(e.pointerId)
    panOrigin.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    }
    setDragging(true)
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!panOrigin.current) return
    setOffset({
      x: panOrigin.current.ox + (e.clientX - panOrigin.current.x),
      y: panOrigin.current.oy + (e.clientY - panOrigin.current.y),
    })
  }

  const onPointerUp = (e: ReactPointerEvent) => {
    if (panOrigin.current) e.currentTarget.releasePointerCapture(e.pointerId)
    panOrigin.current = null
    setDragging(false)
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (isZoomed) return
    if (Math.abs(info.offset.y) > DISMISS_Y || Math.abs(info.velocity.y) > 750) {
      requestClose()
      return
    }
    if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 550) {
      go(info.offset.x < 0 ? index + 1 : index - 1)
    }
  }

  if (!item) return null

  return (
    <div
      ref={rootRef}
      className={`mp ${open ? "mp--open" : ""}`}
      role={open ? "dialog" : undefined}
      aria-modal={open ? true : undefined}
      aria-labelledby={open ? titleId : undefined}
      tabIndex={open ? -1 : undefined}
      aria-hidden={!open}
    >
      <AnimatePresence>
        {open && (
          <motion.button
            key="backdrop"
            type="button"
            className="mp__backdrop"
            aria-label="Close preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
            onClick={requestClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.header
            key="top"
            className="mp__top"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{
              duration: reduceMotion ? 0 : 0.18,
              delay: reduceMotion ? 0 : 0.05,
              ease: "easeOut",
            }}
          >
            <div className="mp__meta">
              <p id={titleId} className="mp__title">
                {item.title}
              </p>
              <p className="mp__caption">{item.caption}</p>
            </div>
            <div className="mp__actions">
              <span className="mp__counter" aria-live="polite">
                {index + 1}
                <span>/</span>
                {count}
              </span>
              {canZoom && (
                <>
                  <button
                    type="button"
                    className="mp__btn"
                    onClick={() => zoomBy(-0.35)}
                    aria-label="Zoom out"
                  >
                    <IconZoomOut />
                  </button>
                  <button
                    type="button"
                    className="mp__btn"
                    onClick={() => zoomBy(0.35)}
                    aria-label="Zoom in"
                  >
                    <IconZoomIn />
                  </button>
                </>
              )}
              <button
                type="button"
                className="mp__btn"
                onClick={() => void toggleFullscreen()}
                aria-label="Fullscreen"
              >
                <IconFullscreen />
              </button>
              <button
                type="button"
                className="mp__btn"
                onClick={download}
                aria-label="Download"
              >
                <IconDownload />
              </button>
              <button
                type="button"
                className="mp__btn"
                onClick={requestClose}
                aria-label="Close"
              >
                <IconClose />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.button
            key="prev"
            type="button"
            className="mp__nav mp__nav--prev"
            aria-label="Previous"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, delay: 0.08 }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              go(index - 1)
            }}
          >
            <IconChevron className="mp__nav-icon mp__nav-icon--flip" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.button
            key="next"
            type="button"
            className="mp__nav mp__nav--next"
            aria-label="Next"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, delay: 0.08 }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              go(index + 1)
            }}
          >
            <IconChevron />
          </motion.button>
        )}
      </AnimatePresence>

      {open && (
        <div className="mp__stage">
          {/*
            Zoom/drag live on the FRAME, never on the layoutId image.
            Gestures stay off until morph completes so centering can't drift.
          */}
          <motion.div
            className="mp__frame"
            drag={gesturesOn && !isZoomed && !reduceMotion}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.18}
            onDragEnd={onDragEnd}
            onWheel={onWheel}
            animate={
              gesturesOn
                ? { scale: zoom, x: offset.x, y: offset.y }
                : { scale: 1, x: 0, y: 0 }
            }
            transition={
              gesturesOn
                ? { type: "spring", stiffness: 400, damping: 40 }
                : { duration: 0 }
            }
            style={{
              cursor: isZoomed
                ? dragging
                  ? "grabbing"
                  : "grab"
                : gesturesOn
                  ? "grab"
                  : "default",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={() => {
              if (!canZoom || !gesturesOn) return
              if (isZoomed) resetView()
              else setZoom(2.15)
            }}
          >
            <motion.img
              key={item.id}
              layoutId={`photo-${item.id}`}
              className="mp__media"
              src={item.src}
              alt={item.title}
              width={item.width}
              height={item.height}
              draggable={false}
              style={{ borderRadius: 16 }}
              transition={morphTransition}
              onLayoutAnimationComplete={() => setGesturesOn(true)}
            />
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.footer
            key="thumbs"
            className="mp__thumbs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{
              duration: reduceMotion ? 0 : 0.18,
              delay: reduceMotion ? 0 : 0.08,
              ease: "easeOut",
            }}
          >
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
                  <img src={thumb.src} alt="" />
                </button>
              ))}
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  )
}
