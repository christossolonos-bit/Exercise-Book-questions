import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Lang } from '../i18n'
import type { AnswerValue } from '../answers'
import type { LocalizedText, Question, QuestionSet } from '../questions'

export type PdfLabels = {
  title: string
  subtitle: string
  forLabel: string
  generatedOn: string
  feelLabel: string
  describeLabel: string
  personN: string
}

const ACCENT = '#a8743f'
const INK = '#2c2a27'
const MUTED = '#6f6a63'
const LINE = '#e7ddcf'

const s = StyleSheet.create({
  page: {
    fontFamily: 'DejaVu',
    fontSize: 11,
    color: INK,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    lineHeight: 1.5,
  },
  coverTitle: { fontSize: 26, fontWeight: 'bold', color: INK, marginBottom: 6 },
  coverSub: { fontSize: 12, color: ACCENT, marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 },
  meta: { fontSize: 11, color: MUTED, marginBottom: 2 },
  chapterPart: { fontSize: 9, color: ACCENT, textTransform: 'uppercase', letterSpacing: 1, marginTop: 18 },
  chapterTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: INK,
    marginTop: 2,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  qBlock: { marginBottom: 12 },
  prompt: { fontSize: 11, fontWeight: 'bold', color: INK, marginBottom: 3 },
  answer: { fontSize: 11, color: INK },
  answerLabel: { color: MUTED },
  answerFeel: { color: ACCENT },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 9,
    color: MUTED,
    textAlign: 'center',
  },
})

type Ctx = {
  L: (x?: LocalizedText) => string
  labels: PdfLabels
  roles: Record<string, LocalizedText>
}

function renderAnswer(q: Question, value: AnswerValue, ctx: Ctx) {
  const { L, labels } = ctx
  const optionLabel = (val: string) => L(q.options?.find((o) => o.value === val)?.label) || val

  switch (q.type) {
    case 'single_choice':
      return <Text style={s.answer}>{optionLabel(String(value))}</Text>
    case 'multi_choice':
      return <Text style={s.answer}>{(value as string[]).map(optionLabel).join(', ')}</Text>
    case 'percentage':
      return <Text style={s.answer}>{Number(value)}%</Text>
    case 'fields': {
      const v = (value as Record<string, string>) || {}
      return (
        <View>
          {q.fields?.map((f) =>
            v[f.key]?.trim() ? (
              <Text key={f.key} style={s.answer}>
                <Text style={s.answerLabel}>{L(f.label)}: </Text>
                {v[f.key]}
              </Text>
            ) : null,
          )}
        </View>
      )
    }
    case 'list': {
      const items = (value as string[]) || []
      return (
        <View>
          {items.map((it, i) =>
            it?.trim() ? (
              <Text key={i} style={s.answer}>
                <Text style={s.answerLabel}>{i + 1}. </Text>
                {q.itemPrefix ? L(q.itemPrefix) + ' ' : ''}
                {it}
              </Text>
            ) : null,
          )}
        </View>
      )
    }
    case 'paired': {
      const v = (value as { describe?: string; feel?: string }) || {}
      return (
        <View>
          {v.describe?.trim() ? (
            <Text style={s.answer}>
              <Text style={s.answerLabel}>{labels.describeLabel}: </Text>
              {v.describe}
            </Text>
          ) : null}
          {v.feel?.trim() ? (
            <Text style={s.answer}>
              <Text style={s.answerFeel}>{labels.feelLabel} </Text>
              {v.feel}
            </Text>
          ) : null}
        </View>
      )
    }
    case 'role_grid': {
      const rows = (value as { name: string; role: string }[]) || []
      return (
        <View>
          {rows.map((r, i) =>
            r.name?.trim() || r.role ? (
              <Text key={i} style={s.answer}>
                <Text style={s.answerLabel}>
                  {labels.personN} {i + 1}:{' '}
                </Text>
                {r.name}
                {r.role ? <Text style={s.answerLabel}> — {L(ctx.roles[r.role])}</Text> : null}
              </Text>
            ) : null,
          )}
        </View>
      )
    }
    default:
      return <Text style={s.answer}>{String(value)}</Text>
  }
}

// A value counts as answered if it has real content (mirror of the app's check).
function hasContent(v: AnswerValue): boolean {
  if (v == null) return false
  if (typeof v === 'string') return v.trim() !== ''
  if (typeof v === 'number') return true
  if (Array.isArray(v)) return v.some(hasContent)
  if (typeof v === 'object') return Object.values(v as object).some(hasContent)
  return false
}

export function WorkbookPdf({
  set,
  answers,
  lang,
  labels,
  reader,
  dateStr,
}: {
  set: QuestionSet
  answers: Record<string, AnswerValue>
  lang: Lang
  labels: PdfLabels
  reader: string
  dateStr: string
}) {
  const L = (x?: LocalizedText) => (x ? x[lang] : '')
  const ctx: Ctx = { L, labels, roles: set.roles }

  return (
    <Document title={`${labels.title} — ${reader}`} author={reader}>
      <Page size="A4" style={s.page}>
        {/* Cover header */}
        <Text style={s.coverSub}>{labels.subtitle}</Text>
        <Text style={s.coverTitle}>{labels.title}</Text>
        <Text style={s.meta}>
          {labels.forLabel}: {reader}
        </Text>
        <Text style={s.meta}>
          {labels.generatedOn}: {dateStr}
        </Text>

        {set.chapters.map((chapter) => {
          const answered = chapter.questions.filter((q) => hasContent(answers[q.id]))
          if (answered.length === 0) return null
          return (
            <View key={chapter.id} wrap>
              <Text style={s.chapterPart}>{L(chapter.part)}</Text>
              <Text style={s.chapterTitle}>{L(chapter.title)}</Text>
              {answered.map((q) => (
                <View key={q.id} style={s.qBlock} wrap={false}>
                  <Text style={s.prompt}>{L(q.prompt)}</Text>
                  {renderAnswer(q, answers[q.id], ctx)}
                </View>
              ))}
            </View>
          )
        })}

        <Text
          style={s.footer}
          fixed
          render={({ pageNumber, totalPages }) => `${labels.title}   ·   ${pageNumber} / ${totalPages}`}
        />
      </Page>
    </Document>
  )
}
