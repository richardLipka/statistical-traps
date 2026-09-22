import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { toneStroke, type Tone } from '@/components/ui/tone'
import { cn } from '@/utils/cn'
import type { Point } from '@/utils/geometry'
import { isHit, type Dart, type Target } from '@/scenarios/01-dartboard/model'

const SCALE = 100
const KEYBOARD_STEP = 0.01
const KEYBOARD_STEP_LARGE = 0.05

export interface BoardTarget {
  id: string
  target: Target
  tone: Tone
  draggable?: boolean
  ariaLabel?: string
}

export interface DartBoardViewProps {
  darts: readonly Dart[]
  targets: readonly BoardTarget[]
  ariaLabel: string
  /** Tone of darts outside every target - "fresh" marks a new, independent set. */
  dartTone?: Tone
  /** Called with a new centre in board coordinates while dragging or on arrow keys. */
  onMove?: (id: string, centre: Point) => void
  className?: string
}

/**
 * The board itself: darts, targets, and direct manipulation of the target
 * that may be moved. A dart is coloured by the first target that contains it,
 * so "inside" is always visible without reading any number.
 */
export function DartBoardView({
  darts,
  targets,
  ariaLabel,
  dartTone = 'neutral',
  onMove,
  className,
}: DartBoardViewProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<string | null>(null)

  const toBoardCoordinates = (event: PointerEvent): Point | null => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    }
  }

  const handlePointerDown = (id: string) => (event: PointerEvent<SVGCircleElement>) => {
    if (!onMove) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(id)
    const point = toBoardCoordinates(event)
    if (point) onMove(id, point)
  }

  const handlePointerMove = (id: string) => (event: PointerEvent<SVGCircleElement>) => {
    if (!onMove || dragging !== id) return
    const point = toBoardCoordinates(event)
    if (point) onMove(id, point)
  }

  const handlePointerUp = (event: PointerEvent<SVGCircleElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(null)
  }

  const handleKeyDown = (boardTarget: BoardTarget) => (event: KeyboardEvent<SVGCircleElement>) => {
    if (!onMove) return
    const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP
    const deltas: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    }
    const delta = deltas[event.key]
    if (!delta) return
    event.preventDefault()
    onMove(boardTarget.id, {
      x: boardTarget.target.x + delta.x,
      y: boardTarget.target.y + delta.y,
    })
  }

  const toneOfDart = (dart: Dart): Tone => {
    for (const boardTarget of targets) {
      if (isHit(dart, boardTarget.target)) return boardTarget.tone
    }
    return dartTone
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SCALE} ${SCALE}`}
      className={cn('aspect-square w-full touch-none rounded-xl border border-slate-300 bg-board', className)}
      role="img"
      aria-label={ariaLabel}
    >
      {/* Clicking the board moves the draggable target there: easier than
          catching a small circle, and the same gesture works on touch. */}
      <rect
        x={0}
        y={0}
        width={SCALE}
        height={SCALE}
        fill="transparent"
        onPointerDown={(event) => {
          const movable = targets.find((boardTarget) => boardTarget.draggable)
          if (!onMove || !movable) return
          const point = toBoardCoordinates(event)
          if (point) onMove(movable.id, point)
        }}
      />

      {targets.map((boardTarget) => (
        <circle
          key={`halo-${boardTarget.id}`}
          cx={boardTarget.target.x * SCALE}
          cy={boardTarget.target.y * SCALE}
          r={boardTarget.target.radius * SCALE}
          fill={toneStroke[boardTarget.tone]}
          opacity={0.08}
        />
      ))}

      {darts.map((dart, index) => {
        const tone = toneOfDart(dart)
        const isInside = targets.some((boardTarget) => isHit(dart, boardTarget.target))
        return (
          <circle
            key={index}
            cx={dart.x * SCALE}
            cy={dart.y * SCALE}
            r={isInside ? 1.3 : 1}
            fill={toneStroke[tone]}
            opacity={isInside ? 1 : 0.65}
          />
        )
      })}

      {targets.map((boardTarget) => (
        <circle
          key={boardTarget.id}
          cx={boardTarget.target.x * SCALE}
          cy={boardTarget.target.y * SCALE}
          r={boardTarget.target.radius * SCALE}
          fill="transparent"
          stroke={toneStroke[boardTarget.tone]}
          strokeWidth={boardTarget.draggable ? 1.2 : 1}
          strokeDasharray={boardTarget.draggable ? '3 2' : undefined}
          className={cn(
            boardTarget.draggable && onMove
              ? dragging === boardTarget.id
                ? 'cursor-grabbing'
                : 'cursor-grab'
              : undefined,
          )}
          tabIndex={boardTarget.draggable && onMove ? 0 : undefined}
          role={boardTarget.draggable && onMove ? 'button' : undefined}
          aria-label={boardTarget.ariaLabel}
          onPointerDown={boardTarget.draggable ? handlePointerDown(boardTarget.id) : undefined}
          onPointerMove={boardTarget.draggable ? handlePointerMove(boardTarget.id) : undefined}
          onPointerUp={boardTarget.draggable ? handlePointerUp : undefined}
          onPointerCancel={boardTarget.draggable ? handlePointerUp : undefined}
          onKeyDown={boardTarget.draggable ? handleKeyDown(boardTarget) : undefined}
        />
      ))}
    </svg>
  )
}
