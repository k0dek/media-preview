# Lumen — Media Preview

A multi-media image & video previewer built with **Motion** (Emil Kowalski’s recommended animation library for layout / enter-exit / springs).

## Why this stack

Emil’s curated picks don’t include a lightbox package. For crafted UI motion he points at **Motion**. Lumen uses that path:

- Shared-element open via `layoutId`
- Spring morphs for slide changes
- Drag-to-dismiss / swipe navigation
- Reduced-motion aware

## Features

- Image + video slides in one gallery
- Prev / next, keyboard, thumbnails
- Zoom (wheel, double-click, buttons) + pan
- Counter, captions, credit
- Fullscreen, download
- Focusable dialog, body scroll lock
- Mobile-friendly gestures

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Static Vite app — works on Vercel with zero config.
