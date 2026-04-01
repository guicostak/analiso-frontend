import type { SegmentData } from './sankeyData'

// ── Colors matching the original design ───────────────────────
const C_BLUE   = 'rgb(36, 149, 224)'
const C_TEAL   = 'rgb(111, 231, 213)'
const C_AMBER  = 'rgb(229, 176, 97)'
const C_BG     = 'rgb(27, 34, 45)'
const C_LABEL_BG  = 'rgb(234, 244, 255)'
const C_LABEL_TXT = 'rgb(27, 34, 45)'

// ── Layout constants ──────────────────────────────────────────
const SVG_W   = 811
const SVG_H   = 500
const OX      = 5    // outer translate X
const OY      = 60   // outer translate Y
const NODE_W  = 20
const GAP     = 8    // vertical gap between nodes in same layer

// Layer x positions (inside the outer translate group)
const LAYER_X = [0, 160, 320, 470, 615]

// ── Node definitions ──────────────────────────────────────────
interface NodeDef {
  id: string; label: string; layer: number; color: string
}
interface LinkDef {
  source: string; target: string; getValue: (v: Vals) => number
}
type Vals = Record<string, number>

const NODES: NodeDef[] = [
  { id: 'ext',   label: 'Mercados Externos', layer: 0, color: C_BLUE  },
  { id: 'ind',   label: 'Brasil - Indústr.', layer: 0, color: C_BLUE  },
  { id: 'ene',   label: 'Brasil - Energia',  layer: 0, color: C_BLUE  },
  { id: 'rev',   label: 'Receita',           layer: 1, color: C_BLUE  },
  { id: 'cost',  label: 'Custo de Vendas',   layer: 2, color: C_AMBER },
  { id: 'gp',    label: 'Lucro Bruto',       layer: 2, color: C_TEAL  },
  { id: 'elim',  label: 'Eliminações',       layer: 2, color: C_AMBER },
  { id: 'earn',  label: 'Lucros',            layer: 3, color: C_TEAL  },
  { id: 'exp',   label: 'Despesas',          layer: 3, color: C_AMBER },
  { id: 'admin', label: 'Geral e Admin.',    layer: 4, color: C_AMBER },
  { id: 'mkt',   label: 'Vendas e Mkt.',     layer: 4, color: C_AMBER },
  { id: 'nonop', label: 'Desp. Não Op.',     layer: 4, color: C_AMBER },
  { id: 'other', label: 'Outros',            layer: 4, color: C_TEAL  },
]

const LINKS: LinkDef[] = [
  { source: 'ext',  target: 'rev',   getValue: v => v.ext   },
  { source: 'ind',  target: 'rev',   getValue: v => v.ind   },
  { source: 'ene',  target: 'rev',   getValue: v => v.ene   },
  { source: 'rev',  target: 'cost',  getValue: v => v.cost  },
  { source: 'rev',  target: 'gp',    getValue: v => v.gp    },
  { source: 'rev',  target: 'elim',  getValue: v => v.elim  },
  { source: 'gp',   target: 'earn',  getValue: v => v.earn  },
  { source: 'gp',   target: 'exp',   getValue: v => v.exp   },
  { source: 'exp',  target: 'admin', getValue: v => v.admin },
  { source: 'exp',  target: 'mkt',   getValue: v => v.mkt   },
  { source: 'exp',  target: 'nonop', getValue: v => v.nonop },
  { source: 'exp',  target: 'other', getValue: v => v.other },
]

const LAYER_IDS = [
  ['ext', 'ind', 'ene'],
  ['rev'],
  ['cost', 'gp', 'elim'],
  ['earn', 'exp'],
  ['admin', 'mkt', 'nonop', 'other'],
]

// ── Layout computation ────────────────────────────────────────
interface LNode extends NodeDef { x: number; y: number; h: number }
interface LLink { source: string; target: string; x0: number; y0: number; x1: number; y1: number; lh: number; color: string }

function toVals(d: SegmentData): Vals {
  const exp = d.geralAdmin + d.vendasMkt + d.despNaoOp + d.outros
  return {
    ext: d.mercadosExternos, ind: d.brasilIndustria, ene: d.brasilEnergia,
    rev: d.receita, cost: d.custoVendas, gp: d.lucroBruto, elim: d.eliminacoes,
    earn: d.lucros, exp,
    admin: d.geralAdmin, mkt: d.vendasMkt, nonop: d.despNaoOp, other: d.outros,
  }
}

function computeLayout(d: SegmentData) {
  const v = toVals(d)
  const usableH = SVG_H - OY - 20
  const maxLayerTotal = Math.max(...LAYER_IDS.map(ids => ids.reduce((s, id) => s + v[id], 0)))
  const maxNodes = Math.max(...LAYER_IDS.map(l => l.length))
  const scale = (usableH - GAP * (maxNodes - 1)) / maxLayerTotal

  const nodeMap = new Map<string, LNode>()
  LAYER_IDS.forEach((ids, li) => {
    const totalH = ids.reduce((s, id) => s + v[id] * scale, 0) + GAP * (ids.length - 1)
    let y = (usableH - totalH) / 2
    ids.forEach(id => {
      const def = NODES.find(n => n.id === id)!
      const h = Math.max(v[id] * scale, 2)
      nodeMap.set(id, { ...def, x: LAYER_X[li], y, h })
      y += h + GAP
    })
  })

  const srcOff = new Map<string, number>()
  const tgtOff = new Map<string, number>()
  NODES.forEach(n => { srcOff.set(n.id, 0); tgtOff.set(n.id, 0) })

  const links: LLink[] = LINKS.map(def => {
    const lv = def.getValue(v)
    const lh = Math.max(lv * scale, 1)
    const src = nodeMap.get(def.source)!
    const tgt = nodeMap.get(def.target)!
    const y0 = src.y + (srcOff.get(def.source) ?? 0)
    const y1 = tgt.y + (tgtOff.get(def.target) ?? 0)
    srcOff.set(def.source, (srcOff.get(def.source) ?? 0) + lh)
    tgtOff.set(def.target, (tgtOff.get(def.target) ?? 0) + lh)
    return { source: def.source, target: def.target, x0: src.x + NODE_W, y0, x1: tgt.x, y1, lh, color: src.color }
  })

  return { nodes: Array.from(nodeMap.values()), links, vals: v }
}

// ── Formatters ────────────────────────────────────────────────
function fmt(v: number): string {
  if (v >= 1) return `R$${v.toFixed(2)}b`
  return `R$${(v * 1000).toFixed(0)}m`
}

// ── SVG generators ────────────────────────────────────────────
function bezierPath(l: LLink): string {
  const mx = (l.x0 + l.x1) / 2
  return [
    `M ${l.x0} ${l.y0}`,
    `C ${mx} ${l.y0}, ${mx} ${l.y1}, ${l.x1} ${l.y1}`,
    `L ${l.x1} ${l.y1 + l.lh}`,
    `C ${mx} ${l.y1 + l.lh}, ${mx} ${l.y0 + l.lh}, ${l.x0} ${l.y0 + l.lh}`,
    'Z',
  ].join(' ')
}

function labelSvg(n: LNode, valStr: string): string {
  const name = n.label
  const labelW = Math.max(name.length, valStr.length) * 6.5 + 18
  const labelH = 36
  // Center label on node's x center
  const cx = n.x + NODE_W / 2
  const lx = cx - labelW / 2
  // Float above node, clamp so it doesn't go off top
  const ly = Math.max(2, n.y - labelH - 8)

  return `
    <line x1="${cx}" y1="${ly + labelH}" x2="${cx}" y2="${n.y}"
      stroke="${n.color}" stroke-width="1" stroke-dasharray="2,2" opacity="0.5"/>
    <rect x="${lx}" y="${ly}" width="${labelW}" height="${labelH}" rx="5"
      fill="${C_LABEL_BG}" fill-opacity="0.95"/>
    <text x="${cx}" y="${ly + 13}" text-anchor="middle"
      font-size="9" fill="${C_LABEL_TXT}" font-family="Inter, system-ui, sans-serif">${name}</text>
    <text x="${cx}" y="${ly + 26}" text-anchor="middle"
      font-size="10" font-weight="700" fill="${C_LABEL_TXT}" font-family="Inter, system-ui, sans-serif">${valStr}</text>
  `
}

// ── Main generator ────────────────────────────────────────────
export function generateSankeyHtml(data: SegmentData): string {
  const { nodes, links, vals } = computeLayout(data)

  const linkPaths = links.map(l =>
    `<path d="${bezierPath(l)}" fill="rgba(255,255,255,0.18)" stroke="none"/>`
  ).join('\n')

  const nodeRects = nodes.map(n =>
    `<rect x="${n.x}" y="${n.y}" width="${NODE_W}" height="${n.h}" fill="${n.color}" rx="3"/>`
  ).join('\n')

  const labels = nodes.map(n => labelSvg(n, fmt(vals[n.id]))).join('\n')

  return `
    <svg
      width="100%" viewBox="0 0 ${SVG_W} ${SVG_H}"
      style="overflow:visible;display:block;"
    >
      <!-- background -->
      <rect width="${SVG_W}" height="${SVG_H}" fill="${C_BG}" rx="12"/>

      <g transform="translate(${OX}, ${OY})">
        <!-- links -->
        ${linkPaths}
        <!-- nodes -->
        ${nodeRects}
        <!-- labels -->
        ${labels}
      </g>
    </svg>
  `
}
