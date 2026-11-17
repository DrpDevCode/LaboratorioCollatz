export interface Point {
  x: number
  y: number
}

export type Triangle = [Point, Point, Point]

/** Desenha no contexto já transformado (zoom/pan). `scale` permite manter traços com 1px na tela. */
export type DrawFn = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => void
