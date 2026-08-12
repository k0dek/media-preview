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
} from "motion/react"
import {
  IconChevron,
  IconClose,
  IconDownload,
  IconFullscreen,
  IconZoomIn,
  IconZoomOut,
} from "./icons"
import type { MediaPreviewProps, OriginRect } from "./types"
import "./MediaPreview.css"

const MIN_ZOOM = 1
const MAX_ZOOM = 4

const spring = {
  type: "spring" as const,
  stiffness: 340,
  damping: 34,
  mass: 0.85,
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function targetSize(item: { width: number; height: number }) {
  const maxW = Math.min(window.innerWidth * 0.92, 980)
  const maxH = Math.min(window.innerHeight * 0.68, 720)
  const scale = Math.min(maxW / item.width, maxH / item.height, 1)
  return {
    width: Math.round(item.width * scale),
    height: Math.round(item.height * scale),
  }
}

function centerPos(size: { width: number; height: number }) {
  return {
    top: Math.round((window.innerHeight - size.height) / 2),
    left: Math.round((window.innerWidth - size.width) / 2),
  }
}

/** Map a fixed centered box so it visually matches `rect` (FLIP). */
function flipFrom(rect: OriginRect, size: { width: number; height: number }, pos: { top: number; left: number }) {
  const fromCx = rect.left + rect.width / 2
  const fromCy = rect.top + rect.height / 2
  const toCx = pos.left + size.width / 2
  const toCy = pos.top + size.height / 2
  return {
    x: fromCx - toCx,
    y: fromCy - toCy,
    scaleX: rect.width / size.width,
    scaleY: rect.height / size.height,
  }
}

export function MediaPreview({
  items,
  index,
  open,
  origin,
  onClose,
  onIndexChange,
  onExitComplete,
}: MediaPreviewProps) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const openFrom = useRef<OriginRect | null>(null)
  const exitTo = useRef<OriginRect | null>(null)

  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
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

  const box =
    item && typeof window !== "undefined"
      ? (() => {
          const size = targetSize(item)
          const pos = centerPos(size)
          return { ...size, ...pos }
        })()
      : { width: 600, height: 400, top: 0, left: 0 }

  useEffect(() => {
    if (open && origin) {
      openFrom.current = origin
      exitTo.current = origin
    }
    if (!open) setGesturesOn(false)
  }, [open, origin])

  // Keep exit target in sync when parent updates origin (on close / navigate).
  useEffect(() => {
    if (origin) exitTo.current = origin
  }, [origin])

  const resetView = useCallback(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const go = useCallback(
    (next: number) => {
      if (!count) return
      setZoom(1)
      setOffset({ x: 0, y: 0 })
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
    const sbw = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.body.style.overflow
    const prevPadding = document.body.style.paddingRight
    document.body.style.overflow = "hidden"
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPadding
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setZoom(1)
      setOffset({ x: 0, y: 0 })
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

  if (!item) return null

  const from = openFrom.current ?? origin
  const to = exitTo.current ?? origin
  const size = { width: box.width, height: box.height }
  const pos = { top: box.top, left: box.left }
  const readyBox = box.width > 0 && (from || reduceMotion)

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
                onClick={onClose}
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

      <AnimatePresence
        onExitComplete={() => {
          openFrom.current = null
          exitTo.current = null
          onExitComplete?.()
        }}
      >
        {open && readyBox && from && (
          <motion.div
            key="photo-frame"
            className="mp__frame"
            initial={
              reduceMotion
                ? { opacity: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 }
                : { opacity: 1, ...flipFrom(from, size, pos) }
            }
            animate={{ opacity: 1, x: 0, y: 0, scaleX: 1, scaleY: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : to
                  ? { opacity: 1, ...flipFrom(to, size, pos) }
                  : { opacity: 0 }
            }
            transition={reduceMotion ? { duration: 0.15 } : spring}
            onAnimationComplete={() => {
              if (open) setGesturesOn(true)
            }}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: size.width,
              height: size.height,
              borderRadius: 16,
              overflow: "hidden",
              transformOrigin: "center center",
              zIndex: 2,
              pointerEvents: "auto",
            }}
            onWheel={onWheel}
          >
            <div
              className="mp__zoom"
              style={{
                width: "100%",
                height: "100%",
                transform:
                  gesturesOn && (isZoomed || offset.x || offset.y)
                    ? `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`
                    : undefined,
                cursor: isZoomed
                  ? dragging
                    ? "grabbing"
                    : "grab"
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
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={item.id}
                  className="mp__media"
                  src={item.src}
                  alt={item.title}
                  width={item.width}
                  height={item.height}
                  draggable={false}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.16 }}
                />
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
