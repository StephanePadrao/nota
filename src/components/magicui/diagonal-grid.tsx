import React, { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface DiagonalGridProps extends React.HTMLAttributes<HTMLDivElement> {
  lineSize?: number
  gridGap?: number
  flickerChance?: number
  color?: string
  width?: number
  height?: number
  className?: string
  maxOpacity?: number
}

export const DiagonalGrid: React.FC<DiagonalGridProps> = ({
  lineSize = 8,
  gridGap = 12,
  flickerChance = 0.15,
  color,
  width,
  height,
  className,
  maxOpacity = 0.45,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<{
    squares: Float32Array
    cols: number
    rows: number
    dpr: number
    colorPrefix: string
    lastTime: number
    rafId: number
  } | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  const resolveColorPrefix = useCallback((): string => {
    if (typeof window === "undefined") return "rgba(0,0,0,"
    const colorToResolve = color || "var(--foreground)"
    const el = document.createElement("div")
    el.style.color = colorToResolve
    el.style.position = "absolute"
    el.style.visibility = "hidden"
    document.body.appendChild(el)
    const computed = window.getComputedStyle(el).color
    document.body.removeChild(el)
    const m = computed.match(/\d+/g)
    if (!m) return "rgba(0,0,0,"
    return `rgba(${m[0]},${m[1]},${m[2]},`
  }, [color])

  const drawCell = useCallback((
    ctx: CanvasRenderingContext2D,
    ci: number, cj: number,
    opacity: number,
    dpr: number,
    colorPrefix: string
  ) => {
    const x = ci * (lineSize + gridGap) * dpr
    const y = cj * (lineSize + gridGap) * dpr
    const size = lineSize * dpr
    ctx.clearRect(x - 1, y - 1, size + 2, size + 2)
    if (opacity > 0.01) {
      ctx.strokeStyle = `${colorPrefix}${opacity})`
      ctx.beginPath()
      ctx.moveTo(x, y + size)
      ctx.lineTo(x + size, y)
      ctx.stroke()
    }
  }, [lineSize, gridGap])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = width || container.clientWidth
    const h = height || container.clientHeight
    setCanvasSize({ width: w, height: h })

    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    ctx.lineWidth = 1.5 * dpr
    ctx.lineCap = "round"

    const cols = Math.floor(w / (lineSize + gridGap))
    const rows = Math.floor(h / (lineSize + gridGap))
    const squares = new Float32Array(cols * rows)
    for (let i = 0; i < squares.length; i++) squares[i] = Math.random() * maxOpacity

    const colorPrefix = resolveColorPrefix()

    // Initial full draw
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++)
        drawCell(ctx, i, j, squares[i * rows + j], dpr, colorPrefix)

    const state = { squares, cols, rows, dpr, colorPrefix, lastTime: 0, rafId: 0 }
    stateRef.current = state

    const TARGET_MS = 1000 / 20 // 20 fps

    const animate = (time: number) => {
      const s = stateRef.current!
      if (time - s.lastTime < TARGET_MS) {
        s.rafId = requestAnimationFrame(animate)
        return
      }
      const delta = (time - s.lastTime) / 1000
      s.lastTime = time

      for (let i = 0; i < s.squares.length; i++) {
        if (Math.random() < flickerChance * delta) {
          const op = Math.random() * maxOpacity
          s.squares[i] = op
          drawCell(ctx, Math.floor(i / s.rows), i % s.rows, op, s.dpr, s.colorPrefix)
        }
      }
      s.rafId = requestAnimationFrame(animate)
    }

    state.rafId = requestAnimationFrame(animate)

    // Redraw on theme change
    const observer = new MutationObserver(() => {
      const s = stateRef.current
      if (!s) return
      s.colorPrefix = resolveColorPrefix()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < s.cols; i++)
        for (let j = 0; j < s.rows; j++)
          drawCell(ctx, i, j, s.squares[i * s.rows + j], s.dpr, s.colorPrefix)
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    return () => {
      cancelAnimationFrame(state.rafId)
      observer.disconnect()
    }
  }, [lineSize, gridGap, maxOpacity, flickerChance, width, height, drawCell, resolveColorPrefix])

  return (
    <div ref={containerRef} className={cn("h-full w-full", className)} {...props}>
      <canvas ref={canvasRef} className="pointer-events-none" style={{ width: canvasSize.width, height: canvasSize.height }} />
    </div>
  )
}
