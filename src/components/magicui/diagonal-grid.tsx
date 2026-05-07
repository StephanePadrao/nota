import React, { useCallback, useEffect, useRef } from "react"
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
  const rafRef = useRef<number>(0)

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
    const offscreen = document.createElement("canvas")
    offscreen.width = offscreen.height = 1
    const ctx = offscreen.getContext("2d")
    if (!ctx) return "rgba(0,0,0,"
    ctx.fillStyle = computed
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data)
    return `rgba(${r},${g},${b},`
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

    const TARGET_MS = 1000 / 20

    const start = () => {
      cancelAnimationFrame(rafRef.current)

      const w = width || container.clientWidth
      const h = height || container.clientHeight
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

      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++)
          drawCell(ctx, i, j, squares[i * rows + j], dpr, colorPrefix)

      let lastTime = 0

      const animate = (time: number) => {
        if (time - lastTime < TARGET_MS) {
          rafRef.current = requestAnimationFrame(animate)
          return
        }
        const delta = (time - lastTime) / 1000
        lastTime = time

        for (let i = 0; i < squares.length; i++) {
          if (Math.random() < flickerChance * delta) {
            const op = Math.random() * maxOpacity
            squares[i] = op
            drawCell(ctx, Math.floor(i / rows), i % rows, op, dpr, colorPrefix)
          }
        }
        rafRef.current = requestAnimationFrame(animate)
      }

      rafRef.current = requestAnimationFrame(animate)

      return { squares, cols, rows, dpr, colorPrefix }
    }

    let gridState = start()

    const resizeObserver = new ResizeObserver(() => {
      gridState = start()
    })
    resizeObserver.observe(container)

    const themeObserver = new MutationObserver(() => {
      if (!gridState) return
      gridState.colorPrefix = resolveColorPrefix()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < gridState.cols; i++)
        for (let j = 0; j < gridState.rows; j++)
          drawCell(ctx, i, j, gridState.squares[i * gridState.rows + j], gridState.dpr, gridState.colorPrefix)
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    return () => {
      cancelAnimationFrame(rafRef.current)
      resizeObserver.disconnect()
      themeObserver.disconnect()
    }
  }, [lineSize, gridGap, maxOpacity, flickerChance, width, height, drawCell, resolveColorPrefix])

  return (
    <div ref={containerRef} className={cn("h-full w-full", className)} {...props}>
      <canvas ref={canvasRef} className="pointer-events-none" />
    </div>
  )
}
