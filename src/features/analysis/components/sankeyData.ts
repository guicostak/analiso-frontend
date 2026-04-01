export interface SegmentData {
  mercadosExternos: number
  brasilIndustria: number
  brasilEnergia: number
  receita: number
  custoVendas: number
  lucroBruto: number
  eliminacoes: number
  lucros: number
  geralAdmin: number
  vendasMkt: number
  despNaoOp: number
  outros: number
}

function make(
  ext: number, ind: number, ene: number,
  custoFrac: number, elimFrac: number, netFrac: number,
  adminFrac: number, mktFrac: number, nonOpFrac: number,
): SegmentData {
  const receita = ext + ind + ene
  const custoVendas = receita * custoFrac
  const eliminacoes = receita * elimFrac
  const lucroBruto = receita - custoVendas - eliminacoes
  const lucros = lucroBruto * netFrac
  const totalExp = lucroBruto - lucros
  const geralAdmin = totalExp * adminFrac
  const vendasMkt = totalExp * mktFrac
  const despNaoOp = totalExp * nonOpFrac
  const outros = totalExp - geralAdmin - vendasMkt - despNaoOp
  return { mercadosExternos: ext, brasilIndustria: ind, brasilEnergia: ene, receita, custoVendas, lucroBruto, eliminacoes, lucros, geralAdmin, vendasMkt, despNaoOp, outros }
}

export const YEAR_DATA: Record<number, SegmentData> = {
  2015: make(5.39, 4.70, 2.34, 0.562, 0.215, 0.418, 0.285, 0.590, 0.004),
  2016: make(4.80, 4.15, 2.10, 0.578, 0.222, 0.380, 0.292, 0.584, 0.005),
  2017: make(5.55, 4.62, 2.45, 0.558, 0.212, 0.425, 0.281, 0.590, 0.005),
  2018: make(6.40, 5.28, 2.72, 0.542, 0.204, 0.448, 0.276, 0.594, 0.004),
  2019: make(7.10, 5.82, 2.98, 0.536, 0.198, 0.462, 0.272, 0.598, 0.004),
  2020: make(8.30, 6.40, 3.20, 0.528, 0.190, 0.480, 0.268, 0.602, 0.004),
  2021: make(9.80, 7.50, 3.65, 0.518, 0.182, 0.498, 0.264, 0.606, 0.004),
  2022: make(12.40, 9.20, 4.50, 0.505, 0.175, 0.522, 0.260, 0.610, 0.003),
  2023: make(13.10, 9.80, 4.80, 0.512, 0.180, 0.515, 0.262, 0.608, 0.003),
  2024: make(13.80, 10.30, 5.10, 0.508, 0.177, 0.520, 0.261, 0.609, 0.003),
  2025: make(14.60, 10.90, 5.45, 0.504, 0.174, 0.528, 0.259, 0.611, 0.003),
  2026: make(15.50, 11.60, 5.85, 0.500, 0.172, 0.535, 0.257, 0.613, 0.003),
}

export const YEARS = Object.keys(YEAR_DATA).map(Number).sort((a, b) => a - b)
