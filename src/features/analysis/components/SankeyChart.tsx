'use client'
import React, { useState } from 'react'
import type { IncomeBreakdownYear } from '../interfaces'

const C_BLUE  = '#2496e0'
const C_TEAL  = '#20a08a'
const C_AMBER = '#c4952a'
const C_RED   = '#dc2626'

const W       = 630
const H       = 320
const NW      = 20
const NODE_PAD = 12
const TOP_PAD  = 20
const BOT_PAD  = 20
const L_LABEL  = 120
const R_LABEL  = 130

const CHART_W = W - L_LABEL - R_LABEL
const LAYER_X = [
  L_LABEL,
  L_LABEL + CHART_W * 0.30,
  L_LABEL + CHART_W * 0.60,
  L_LABEL + CHART_W * 0.90,
].map(Math.round)

interface NodeDef { id: string; label: string; layer: number; color: string }
interface LinkDef { source: string; target: string; valueKey: string; color?: string }
type Vals = Record<string, number>
interface LNode extends NodeDef { x: number; y: number; h: number }
interface LLink { source: string; target: string; x0: number; y0: number; x1: number; y1: number; lh0: number; lh1: number; color: string; idx: number }

const NODE_DEFS: NodeDef[] = [
  { id: 'rev',    label: 'Receita Líquida',      layer: 0, color: C_BLUE  },
  { id: 'gp',     label: 'Lucro Bruto',          layer: 1, color: C_TEAL  },
  { id: 'cpv',    label: 'Custo dos Produtos',    layer: 1, color: C_AMBER },
  { id: 'ebit',   label: 'EBIT',                 layer: 2, color: C_TEAL  },
  { id: 'opex',   label: 'Despesas Operacionais', layer: 2, color: C_AMBER },
  { id: 'net',    label: 'Lucro Líquido',         layer: 3, color: C_TEAL  },
  { id: 'finir',  label: 'Financeiro + IR',       layer: 3, color: C_RED   },
]

const LINK_DEFS: LinkDef[] = [
  { source: 'rev',  target: 'gp',    valueKey: 'gp',    color: C_TEAL  },
  { source: 'rev',  target: 'cpv',   valueKey: 'cpv',   color: C_AMBER },
  { source: 'gp',   target: 'ebit',  valueKey: 'ebit',  color: C_TEAL  },
  { source: 'gp',   target: 'opex',  valueKey: 'opex',  color: C_AMBER },
  { source: 'ebit', target: 'net',   valueKey: 'net',   color: C_TEAL  },
  { source: 'ebit', target: 'finir', valueKey: 'finir', color: C_RED   },
]

const LAYERS: string[][] = [
  ['rev'],
  ['gp', 'cpv'],
  ['ebit', 'opex'],
  ['net', 'finir'],
]

function toVals(d: IncomeBreakdownYear): Vals {
  const ebit  = Math.abs(d.ebit)
  // financeiroIR can be negative when financial income + tax credits boost net income above EBIT.
  // In that case, show finir=0 and let all EBIT flow into net (structurally valid for the Sankey).
  const finir = Math.max(0, d.financeiroIR)
  const net   = Math.max(ebit - finir, 0)
  return {
    rev:   Math.abs(d.receita),
    gp:    Math.abs(d.lucroBruto),
    cpv:   Math.abs(d.cpv),
    ebit,
    opex:  Math.abs(d.despesasOp),
    net,
    finir,
  }
}

function fmt(v: number) {
  if (v >= 1e9) return `R$${(v / 1e9).toFixed(1)}b`
  if (v >= 1e6) return `R$${(v / 1e6).toFixed(0)}m`
  if (v >= 1e3) return `R$${(v / 1e3).toFixed(0)}k`
  return `R$${v.toFixed(0)}`
}

function computeLayout(data: IncomeBreakdownYear) {
  const v = toVals(data)
  const usableH = H - TOP_PAD - BOT_PAD

  const maxTotal = Math.max(...LAYERS.map(ids => ids.reduce((s, id) => s + v[id], 0)))
  const maxNodes = Math.max(...LAYERS.map(l => l.length))
  const scale = (usableH - NODE_PAD * (maxNodes - 1)) / maxTotal * 0.75

  const nodeMap = new Map<string, LNode>()

  LAYERS.forEach((ids, li) => {
    const totalH = ids.reduce((s, id) => s + v[id] * scale, 0) + NODE_PAD * (ids.length - 1)
    let y = TOP_PAD + (usableH - totalH) / 2
    ids.forEach(id => {
      const def = NODE_DEFS.find(n => n.id === id)!
      const h = Math.max(v[id] * scale, 3)
      nodeMap.set(id, { ...def, x: LAYER_X[li], y, h })
      y += h + NODE_PAD
    })
  })

  const srcUsed = new Map<string, number>()
  const tgtUsed = new Map<string, number>()
  NODE_DEFS.forEach(n => { srcUsed.set(n.id, 0); tgtUsed.set(n.id, 0) })

  const links: LLink[] = LINK_DEFS.map((def, idx) => {
    const lv = v[def.valueKey]
    const src = nodeMap.get(def.source)!
    const tgt = nodeMap.get(def.target)!
    const lh0 = Math.max((lv / v[def.source]) * src.h, 1)
    const lh1 = Math.max((lv / v[def.target]) * tgt.h, 1)
    const y0 = src.y + (srcUsed.get(def.source) ?? 0)
    const y1 = tgt.y + (tgtUsed.get(def.target) ?? 0)
    srcUsed.set(def.source, (srcUsed.get(def.source) ?? 0) + lh0)
    tgtUsed.set(def.target, (tgtUsed.get(def.target) ?? 0) + lh1)
    return { source: def.source, target: def.target, x0: src.x + NW, y0, x1: tgt.x, y1, lh0, lh1, color: def.color ?? src.color, idx }
  })

  return { nodes: Array.from(nodeMap.values()), links, vals: v }
}

function bezier(l: LLink): string {
  const mx = (l.x0 + l.x1) / 2
  return [
    `M ${l.x0} ${l.y0}`,
    `C ${mx} ${l.y0}, ${mx} ${l.y1}, ${l.x1} ${l.y1}`,
    `L ${l.x1} ${l.y1 + l.lh1}`,
    `C ${mx} ${l.y1 + l.lh1}, ${mx} ${l.y0 + l.lh0}, ${l.x0} ${l.y0 + l.lh0}`,
    'Z',
  ].join(' ')
}

const CARD_COLORS: Record<string, [string, string]> = {
  rev:  ['#dbeafe', '#1e40af'],
  ebit: ['#d1fae5', '#065f46'],
  net:  ['#d1fae5', '#065f46'],
}

function Label({ n, val }: { n: LNode; val: number }) {
  const cy = n.y + n.h / 2
  const valStr = fmt(val)

  // Layer 0 (Receita) -> label à esquerda
  if (n.layer === 0) {
    return (
      <g style={{ pointerEvents: 'none' }}>
        <text x={n.x - 8} y={cy - 6} textAnchor="end" fontSize={10} fill="#6b7280" fontFamily="Inter, system-ui, sans-serif">{n.label}</text>
        <text x={n.x - 8} y={cy + 7} textAnchor="end" fontSize={10} fontWeight="700" fill="#111827" fontFamily="Inter, system-ui, sans-serif">{valStr}</text>
      </g>
    )
  }

  // Last layer -> label à direita
  if (n.layer === 3) {
    return (
      <g style={{ pointerEvents: 'none' }}>
        <text x={n.x + NW + 8} y={cy - 6} textAnchor="start" fontSize={10} fill="#6b7280" fontFamily="Inter, system-ui, sans-serif">{n.label}</text>
        <text x={n.x + NW + 8} y={cy + 7} textAnchor="start" fontSize={10} fontWeight="700" fill="#111827" fontFamily="Inter, system-ui, sans-serif">{valStr}</text>
      </g>
    )
  }

  // Intermediate nodes with card
  const cx = n.x + NW / 2
  if (CARD_COLORS[n.id]) {
    const [bg, fg] = CARD_COLORS[n.id]
    const bw = n.label.length * 6 + 16
    const bh = 18
    const bx = cx - bw / 2
    const by = n.y - bh - 14
    return (
      <g style={{ pointerEvents: 'none' }}>
        <rect x={bx} y={by} width={bw} height={bh} rx={4} fill={bg} />
        <text x={cx} y={by + 12} textAnchor="middle" fontSize={9} fontWeight="600" fill={fg} fontFamily="Inter, system-ui, sans-serif">{n.label}</text>
        <text x={cx} y={n.y - 2} textAnchor="middle" fontSize={9.5} fontWeight="700" fill="#111827" fontFamily="Inter, system-ui, sans-serif">{valStr}</text>
      </g>
    )
  }

  // Default label above node
  return (
    <g style={{ pointerEvents: 'none' }}>
      <text x={cx} y={n.y - 20} textAnchor="middle" fontSize={9} fill="#6b7280" fontFamily="Inter, system-ui, sans-serif">{n.label}</text>
      <text x={cx} y={n.y - 11} textAnchor="middle" fontSize={9.5} fontWeight="700" fill="#111827" fontFamily="Inter, system-ui, sans-serif">{valStr}</text>
    </g>
  )
}

export function SankeyChart({ data }: { data: IncomeBreakdownYear }) {
  const [hovered, setHovered] = useState<{ nodes: Set<string>; links: Set<number> } | null>(null)
  const { nodes, links, vals } = computeLayout(data)

  const onNode = (id: string) => {
    const conn = links.filter(l => l.source === id || l.target === id)
    setHovered({ nodes: new Set([id, ...conn.flatMap(l => [l.source, l.target])]), links: new Set(conn.map(l => l.idx)) })
  }
  const onLink = (l: LLink) => {
    const seeds = new Set([l.source, l.target])
    const conn = links.filter(x => seeds.has(x.source) || seeds.has(x.target))
    setHovered({ nodes: new Set([...seeds, ...conn.flatMap(x => [x.source, x.target])]), links: new Set(conn.map(x => x.idx)) })
  }

  const noHover = hovered === null
  const nOp  = (id: string) => (noHover || hovered!.nodes.has(id)) ? 1 : 0.2
  const lkOp = (idx: number) => (noHover || hovered!.links.has(idx)) ? 0.45 : 0.07

  return (
    <svg
      width="100%" viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', overflow: 'visible' }}
      onMouseLeave={() => setHovered(null)}
    >
      {links.map(l => (
        <path key={l.idx} d={bezier(l)} fill={l.color} fillOpacity={lkOp(l.idx)}
          stroke="none" style={{ cursor: 'pointer', transition: 'fill-opacity 0.18s' }}
          onMouseEnter={() => onLink(l)} />
      ))}

      {nodes.map(n => (
        <rect key={n.id} x={n.x} y={n.y} width={NW} height={n.h} fill={n.color} rx={2}
          opacity={nOp(n.id)} style={{ cursor: 'pointer', transition: 'opacity 0.18s' }}
          onMouseEnter={() => onNode(n.id)} />
      ))}

      {nodes.map(n => (
        <g key={`lbl-${n.id}`} opacity={nOp(n.id)} style={{ transition: 'opacity 0.18s' }}>
          <Label n={n} val={vals[n.id]} />
        </g>
      ))}
    </svg>
  )
}
