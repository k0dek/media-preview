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
  const panOrigin = useRef<{
    x: number
    y: number
    ox: number
    oy: number
  } | null>(null)

  const item = items[index]
  const count = items.length
  const canZoom = !!item && item.kind === "image" && !reduceMotion

  const resetView = useCallback(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const go = useCallback(
    (next: number) => {
      if (!count) return
      onIndexChange(((next % count) + count) % count)
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
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [
    open,
    zoom,
    index,
    go,
    onClose,
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

  useEffect(() => {
    resetView()
  }, [index, resetView])

  const onWheel = (e: ReactWheelEvent) => {
    if (!canZoom) return
    e.preventDefault()
    zoomBy(e.deltaY > 0 ? -0.18 : 0.18)
  }

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!canZoom || zoom <= 1) return
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
    if (zoom > 1) return
    if (Math.abs(info.offset.y) > DISMISS_Y || Math.abs(info.velocity.y) > 750) {
      onClose()
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
      {/* Fade-only chrome — never wrap the shared image in delayed exit */}
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
            onClick={onClose}
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
              <button type="button" className="mp__btn" onClick={onClose} aria-label="Close">
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
            onClick={() => go(index - 1)}
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
            onClick={() => go(index + 1)}
          >
            <IconChevron />
          </motion.button>
        )}
      </AnimatePresence>

      {/*
        Shared element lives OUTSIDE AnimatePresence exit delays.
        Open/close = grid thumb unmounts/remounts in the same commit as this node.
      */}
      {open && (
        <motion.div
          className="mp__stage"
          drag={zoom === 1 && !reduceMotion ? true : false}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={onDragEnd}
          onWheel={onWheel}
        >
          <motion.img
            layoutId={`photo-${item.id}`}
            className="mp__media"
            src={item.src}
            alt={item.title}
            width={item.width}
            height={item.height}
            draggable={false}
            style={{
              borderRadius: 16,
              scale: zoom,
              x: offset.x,
              y: offset.y,
              cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
            }}
            transition={morphTransition}
            onDoubleClick={() => {
              if (!canZoom) return
              if (zoom > 1) resetView()
              else setZoom(2.15)
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
        </motion.div>
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
