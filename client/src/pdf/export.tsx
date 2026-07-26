import { pdf } from '@react-pdf/renderer'
import { registerFonts } from './fonts'
import { WorkbookPdf, type PdfLabels } from './WorkbookPdf'
import type { QuestionSet } from '../questions'
import type { AnswerValue } from '../answers'
import type { Lang } from '../i18n'

function sanitize(name: string) {
  return name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'workbook'
}

export type ExportOpts = {
  set: QuestionSet
  answers: Record<string, AnswerValue>
  lang: Lang
  labels: PdfLabels
  reader: string
  dateStr: string
}

// Builds a real .pdf file and saves it to the reader's computer.
export async function exportWorkbookPdf(opts: ExportOpts) {
  registerFonts()
  const blob = await pdf(<WorkbookPdf {...opts} />).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Who-Are-You-${sanitize(opts.reader)}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return blob
}
