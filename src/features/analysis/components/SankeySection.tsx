'use client'
import { useState, useRef } from 'react'
import { SankeyChart } from './SankeyChart'
import type { IncomeBreakdownYear } from '../interfaces'

interface Props {
  data: IncomeBreakdownYear[]
}

export function SankeySection({ data }: Props) {
  const years = data.map(d => parseInt(d.year)).sort((a, b) => a - b)
  const [year, setYear] = useState(years[years.length - 1] ?? 2024)
  const barRef = useRef<HTMLDivElement>(null)

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 4, fontFamily: "'Inter', system-ui, sans-serif" }}>
          De onde vem o dinheiro e para onde vai?
        </h3>
        <p style={{ fontSize: 13, color: '#6b7280', fontFamily: "'Inter', system-ui, sans-serif" }}>
          Dados indisponíveis.
        </p>
      </div>
    )
  }

  const visibleYears = years.filter(y => y % 2 !== 0 || years.length <= 5)

  function handleBarClick(e: React.MouseEvent<HTMLDivElement>) {
    const bar = barRef.current
    if (!bar) return
    const { left, width } = bar.getBoundingClientRect()
    const ratio = (e.clientX - left) / width
    const idx = Math.min(Math.floor(ratio * years.length), years.length - 1)
    setYear(years[idx])
  }

  const selectedData = data.find(d => d.year === String(year))

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 4, fontFamily: "'Inter', system-ui, sans-serif" }}>
        De onde vem o dinheiro e para onde vai?
      </h3>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
        Este diagrama mostra como a receita se divide entre custos, despesas e lucro. Cada faixa representa um fluxo de dinheiro. Quanto mais larga, maior o valor. Selecione o ano para comparar.
      </p>

      <div
        ref={barRef}
        onClick={handleBarClick}
        style={{ display: 'flex', marginBottom: 0, cursor: 'pointer', userSelect: 'none' }}
      >
        {years.map(y => {
          const isVisible = visibleYears.includes(y)
          const isSelected = y === year
          return (
            <div
              key={y}
              style={{
                flex: 1,
                padding: '5px 0',
                textAlign: 'center',
                fontSize: 11.5,
                fontWeight: isSelected ? 600 : 400,
                fontFamily: "'Inter', system-ui, sans-serif",
                color: isSelected ? '#1d4ed8' : '#6b7280',
                background: isSelected ? '#eff6ff' : 'transparent',
                border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent',
                borderRadius: 6,
                transition: 'all 0.15s',
                visibility: isVisible || isSelected ? 'visible' : 'hidden',
              }}
            >
              {y}
            </div>
          )
        })}
      </div>

      {selectedData && <SankeyChart data={selectedData} />}
    </div>
  )
}
