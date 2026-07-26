import { useLang } from '../i18n'
import type { AnswerValue } from '../answers'
import type { LocalizedText, Question } from '../questions'

// Renders a saved answer value in a readable, print-friendly way.
// Reused by the "My answers" review page and (later) the A4 PDF.
export function AnswerDisplay({
  question,
  value,
  roles,
}: {
  question: Question
  value: AnswerValue
  roles: Record<string, LocalizedText>
}) {
  const { lang, t } = useLang()
  const L = (x?: LocalizedText) => (x ? x[lang] : '')
  const optionLabel = (val: string) =>
    L(question.options?.find((o) => o.value === val)?.label) || val

  const plain = 'whitespace-pre-wrap leading-relaxed text-[var(--ink)]'

  switch (question.type) {
    case 'text':
    case 'longtext':
    case 'statement':
      return <p className={plain}>{String(value)}</p>

    case 'single_choice':
      return <p className={plain}>{optionLabel(String(value))}</p>

    case 'multi_choice':
      return (
        <p className={plain}>{(value as string[]).map(optionLabel).join(', ')}</p>
      )

    case 'percentage':
      return <p className={plain}>{Number(value)}%</p>

    case 'fields': {
      const v = value as Record<string, string>
      return (
        <div className="flex flex-col gap-1">
          {question.fields?.map((f) =>
            v[f.key]?.trim() ? (
              <p key={f.key} className={plain}>
                <span className="text-[var(--muted)]">{L(f.label)}: </span>
                {v[f.key]}
              </p>
            ) : null,
          )}
        </div>
      )
    }

    case 'list': {
      const items = (value as string[]) || []
      return (
        <ol className="flex flex-col gap-1">
          {items.map((it, i) =>
            it?.trim() ? (
              <li key={i} className={plain}>
                <span className="text-[var(--muted)]">{i + 1}. </span>
                {question.itemPrefix ? L(question.itemPrefix) + ' ' : ''}
                {it}
              </li>
            ) : null,
          )}
        </ol>
      )
    }

    case 'paired': {
      const v = value as { describe?: string; feel?: string }
      return (
        <div className="flex flex-col gap-2">
          {v.describe?.trim() && (
            <p className={plain}>
              <span className="text-[var(--muted)]">{t('describeLabel')}: </span>
              {v.describe}
            </p>
          )}
          {v.feel?.trim() && (
            <p className={plain}>
              <span className="text-[var(--accent)]">{t('feelLabel')} </span>
              {v.feel}
            </p>
          )}
        </div>
      )
    }

    case 'role_grid': {
      const rows = (value as { name: string; role: string }[]) || []
      return (
        <ul className="flex flex-col gap-1">
          {rows.map((r, i) =>
            r.name?.trim() || r.role ? (
              <li key={i} className={plain}>
                <span className="text-[var(--muted)]">{t('personN')} {i + 1}: </span>
                {r.name}
                {r.role && <span className="text-[var(--muted)]"> — {L(roles[r.role])}</span>}
              </li>
            ) : null,
          )}
        </ul>
      )
    }

    default:
      return <p className={plain}>{String(value)}</p>
  }
}
