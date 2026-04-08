/**
 * PDF report generation for the Analysis page.
 *
 * Strategy: programmatic branded cover + footer pages, with the actual
 * analysis content captured directly from the rendered DOM via html-to-image.
 * This produces a faithful replica of the on-screen page (charts, layout,
 * colors), independent of dark/light theme and lazy loading state.
 */

import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';
import type { AnalysisData } from '../interfaces';

// ─── Brand palette (mirrors src/styles/globals.css) ──────────────────────────

const BRAND = { r: 14, g: 147, b: 132 };          // #0E9384
const TEXT = { r: 24, g: 28, b: 36 };
const MUTED = { r: 110, g: 116, b: 130 };

// ─── Layout constants (A4 portrait, mm) ──────────────────────────────────────

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 12;
const MARGIN_TOP = 18;
const MARGIN_BOTTOM = 14;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const CONTENT_H = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const todayBR = (): string => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const todayFile = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ─── Header / footer ─────────────────────────────────────────────────────────

function drawHeader(doc: jsPDF, ticker: string) {
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 0, PAGE_W, 6, 'F');
  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont('helvetica', 'normal');
  doc.text('Analiso · Relatório de análise', MARGIN_X, 12);
  doc.setFont('helvetica', 'bold');
  doc.text(ticker, PAGE_W - MARGIN_X, 12, { align: 'right' });
}

function drawFooter(doc: jsPDF) {
  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em ${todayBR()}`, MARGIN_X, PAGE_H - 6);
}

function stampPageNumbers(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.setFont('helvetica', 'normal');
    doc.text(`Página ${i} de ${total}`, PAGE_W - MARGIN_X, PAGE_H - 6, { align: 'right' });
  }
}

// ─── Cover page (programmatic) ───────────────────────────────────────────────

function drawCover(doc: jsPDF, data: AnalysisData) {
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 0, PAGE_W, 78, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('ANALISO', MARGIN_X, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Relatório de análise fundamentalista', MARGIN_X, 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.text(data.company.ticker?.toUpperCase() || '—', MARGIN_X, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  const nameLines = doc.splitTextToSize(data.company.name ?? '', CONTENT_W);
  doc.text(nameLines, MARGIN_X, 66);

  // Body
  let y = 92;
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const meta = [data.company.exchange, data.company.sector, data.company.industry]
    .filter(Boolean).join(' · ');
  if (meta) {
    doc.text(meta, MARGIN_X, y);
    y += 8;
  }

  if (data.company.summaryText || data.company.description) {
    doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(
      data.company.summaryText || data.company.description || '',
      CONTENT_W,
    );
    doc.text(lines.slice(0, 8), MARGIN_X, y);
  }

  // Footer disclaimer mini
  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text(
    `Relatório gerado em ${todayBR()} · Conteúdo informativo, não constitui recomendação de investimento.`,
    MARGIN_X,
    PAGE_H - 12,
  );
}

// ─── Disclaimer page (programmatic) ──────────────────────────────────────────

function drawDisclaimer(doc: jsPDF, ticker: string) {
  doc.addPage();
  drawHeader(doc, ticker);
  drawFooter(doc);

  let y = MARGIN_TOP + 6;

  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(MARGIN_X, y, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.text('Aviso legal e fontes', MARGIN_X + 6, y + 5.5);
  y += 13;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);

  const t1 =
    'Este relatório foi gerado automaticamente pela plataforma Analiso a partir de dados públicos e modelos próprios de avaliação. As informações contidas têm caráter meramente informativo e educativo, não constituindo, em hipótese alguma, recomendação, oferta ou solicitação de compra ou venda de qualquer ativo financeiro.';
  const t2 =
    'Decisões de investimento são de responsabilidade exclusiva do investidor. Rentabilidade passada não representa garantia de rentabilidade futura. Antes de investir, considere seus objetivos, horizonte e tolerância ao risco, e busque orientação de um profissional habilitado.';

  const l1 = doc.splitTextToSize(t1, CONTENT_W);
  doc.text(l1, MARGIN_X, y);
  y += l1.length * 4.6 + 3;

  const l2 = doc.splitTextToSize(t2, CONTENT_W);
  doc.text(l2, MARGIN_X, y);
  y += l2.length * 4.6 + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
  doc.text('Fontes de dados', MARGIN_X, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  const l3 = doc.splitTextToSize(
    'B3, CVM, dados financeiros consolidados das empresas listadas, consenso de analistas de mercado e séries macroeconômicas (Banco Central, IBGE).',
    CONTENT_W,
  );
  doc.text(l3, MARGIN_X, y);
}

// ─── DOM capture & PDF placement ─────────────────────────────────────────────

const CAPTURE_OPTIONS = {
  pixelRatio: 2,
  cacheBust: true,
  backgroundColor: '#ffffff',
  quality: 0.92,
  // Skip elements explicitly marked as hidden in the printed report
  // (e.g. floating action menus, tooltips, the download button itself).
  filter: (node: Node): boolean => {
    if (!(node instanceof HTMLElement)) return true;
    if (node.dataset?.pdfHide === 'true') return false;
    return true;
  },
};

/**
 * Captures a single DOM element as a JPEG and places it in the PDF, slicing
 * across multiple pages if the element is taller than one page. Always starts
 * a new page so each section is visually self-contained.
 */
async function placeElement(
  doc: jsPDF,
  el: HTMLElement,
  ticker: string,
  isFirstSection: boolean,
) {
  // Capture the element at the resolution of its rendered size
  const dataUrl = await toJpeg(el, CAPTURE_OPTIONS);
  const img = await loadImage(dataUrl);

  // Compute scaled height in PDF mm based on the content width
  const targetW = CONTENT_W;
  const fullH = (img.height / img.width) * targetW;

  // Always start a new page for each section
  if (!isFirstSection) doc.addPage();
  drawHeader(doc, ticker);
  drawFooter(doc);

  // If the section fits in a single page, just drop it
  if (fullH <= CONTENT_H) {
    doc.addImage(dataUrl, 'JPEG', MARGIN_X, MARGIN_TOP, targetW, fullH, undefined, 'FAST');
    return;
  }

  // Otherwise slice the source image into page-sized tiles. We do this by
  // re-drawing the image into an offscreen canvas, slice by slice, then
  // converting each slice to a JPEG and placing it on its own page.
  const pxPerMm = img.width / targetW;
  const pageContentPx = CONTENT_H * pxPerMm;

  const sliceCanvas = document.createElement('canvas');
  const sliceCtx = sliceCanvas.getContext('2d');
  if (!sliceCtx) {
    // Fallback: just place the whole image, scaled to fit one page
    const fallbackH = Math.min(fullH, CONTENT_H);
    doc.addImage(dataUrl, 'JPEG', MARGIN_X, MARGIN_TOP, targetW, fallbackH, undefined, 'FAST');
    return;
  }

  let yOffsetPx = 0;
  let firstSlice = true;
  while (yOffsetPx < img.height) {
    const remainingPx = img.height - yOffsetPx;
    const slicePx = Math.min(pageContentPx, remainingPx);

    sliceCanvas.width = img.width;
    sliceCanvas.height = Math.ceil(slicePx);
    sliceCtx.fillStyle = '#ffffff';
    sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    sliceCtx.drawImage(img, 0, -yOffsetPx);

    const sliceDataUrl = sliceCanvas.toDataURL('image/jpeg', 0.92);
    const sliceMm = (slicePx / img.width) * targetW;

    if (!firstSlice) {
      doc.addPage();
      drawHeader(doc, ticker);
      drawFooter(doc);
    }
    doc.addImage(sliceDataUrl, 'JPEG', MARGIN_X, MARGIN_TOP, targetW, sliceMm, undefined, 'FAST');

    yOffsetPx += slicePx;
    firstSlice = false;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export type SectionCapture = {
  id: string;
  el: HTMLElement | null;
};

/**
 * Builds the PDF: programmatic cover, then captured DOM sections, then
 * disclaimer page. Caller is responsible for ensuring all section data is
 * loaded and the DOM is fully rendered (charts, animations) before calling.
 */
export async function generateAnalysisReportFromDOM(opts: {
  data: AnalysisData;
  sections: SectionCapture[];
}): Promise<jsPDF> {
  const { data, sections } = opts;
  const ticker = data.company.ticker?.toUpperCase() || 'EMPRESA';

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  doc.setFont('helvetica', 'normal');

  // Cover (no header band — has its own brand band)
  drawCover(doc, data);

  // Capture and place each section
  let placed = 0;
  for (const section of sections) {
    if (!section.el) continue;
    try {
      await placeElement(doc, section.el, ticker, false);
      placed++;
    } catch (err) {
      console.error(`[pdfReport] capture failed for section ${section.id}`, err);
      // Add an error stub page so the gap is acknowledged in the PDF
      doc.addPage();
      drawHeader(doc, ticker);
      drawFooter(doc);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
      doc.text(`Seção "${section.id}" indisponível`, MARGIN_X, MARGIN_TOP + 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
      doc.text(
        'Não foi possível capturar esta seção. Recarregue a página e tente novamente.',
        MARGIN_X,
        MARGIN_TOP + 18,
      );
    }
  }

  if (placed === 0) {
    throw new Error('Nenhuma seção da análise pôde ser capturada.');
  }

  drawDisclaimer(doc, ticker);
  stampPageNumbers(doc);
  return doc;
}

export async function downloadAnalysisReport(opts: {
  data: AnalysisData;
  sections: SectionCapture[];
}) {
  const doc = await generateAnalysisReportFromDOM(opts);
  const ticker = opts.data.company.ticker?.toUpperCase() || 'analise';
  doc.save(`analiso-${ticker}-${todayFile()}.pdf`);
}
