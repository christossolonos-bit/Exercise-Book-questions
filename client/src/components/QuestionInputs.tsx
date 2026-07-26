import { useLang } from '../i18n'
import type { AnswerValue } from '../answers'
import type { LocalizedText, Option, Question } from '../questions'

const inputClass =
  'w-full rounded-lg border border-[var(--line)] bg-white px-3.5 py-2.5 text-[var(--ink)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]'

type InputProps = {
  question: Question
  value: AnswerValue
  onChange: (v: AnswerValue) => void
  roles: Record<string, LocalizedText>
}

function useL() {
  const { lang } = useLang()
  return (x: LocalizedText) => x[lang]
}

function TextInput({ value, onChange, question }: InputProps) {
  const L = useL()
  return (
    <input
      className={inputClass}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder ? L(question.placeholder) : ''}
      autoFocus
    />
  )
}

function LongTextInput({ value, onChange, question }: InputProps) {
  const L = useL()
  return (
    <textarea
      className={inputClass + ' min-h-40 resize-y leading-relaxed'}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder ? L(question.placeholder) : ''}
      autoFocus
    />
  )
}

function StatementInput({ value, onChange, question }: InputProps) {
  const L = useL()
  return (
    <input
      className={inputClass + ' text-center text-lg font-semibold uppercase tracking-wide'}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
      placeholder={question.placeholder ? L(question.placeholder) : ''}
      autoFocus
    />
  )
}

function FieldsInput({ value, onChange, question }: InputProps) {
  const L = useL()
  const v = (value as Record<string, string>) || {}
  return (
    <div className="flex flex-col gap-4">
      {question.fields?.map((f) => (
        <label key={f.key} className="block text-left">
          <span className="mb-1 block text-sm font-medium text-[var(--muted)]">{L(f.label)}</span>
          <input
            className={inputClass}
            value={v[f.key] || ''}
            onChange={(e) => onChange({ ...v, [f.key]: e.target.value })}
          />
        </label>
      ))}
    </div>
  )
}

function SingleChoice({ value, onChange, question }: InputProps) {
  const L = useL()
  return (
    <div className="flex flex-col gap-2.5">
      {question.options?.map((o: Option) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={
              'flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ' +
              (active
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--line)] bg-white hover:border-[var(--accent)]')
            }
          >
            <span
              className={
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ' +
                (active ? 'border-[var(--accent)]' : 'border-[var(--line)]')
              }
            >
              {active && <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />}
            </span>
            <span>{L(o.label)}</span>
          </button>
        )
      })}
    </div>
  )
}

function MultiChoice({ value, onChange, question }: InputProps) {
  const L = useL()
  const selected = (value as string[]) || []
  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val])
  return (
    <div className="flex flex-col gap-2.5">
      {question.options?.map((o: Option) => {
        const active = selected.includes(o.value)
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={
              'flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ' +
              (active
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--line)] bg-white hover:border-[var(--accent)]')
            }
          >
            <span
              className={
                'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ' +
                (active ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--line)]')
              }
            >
              {active && '✓'}
            </span>
            <span>{L(o.label)}</span>
          </button>
        )
      })}
    </div>
  )
}

function Percentage({ value, onChange }: InputProps) {
  const n = typeof value === 'number' ? value : 0
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-5xl font-semibold text-[var(--accent)]">{n}%</div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={n}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
      />
    </div>
  )
}

function ListInput({ value, onChange, question }: InputProps) {
  const L = useL()
  const count = question.listCount || 5
  const items = (value as string[]) || Array(count).fill('')
  const setItem = (i: number, text: string) => {
    const next = [...items]
    while (next.length < count) next.push('')
    next[i] = text
    onChange(next)
  }
  const prefix = question.itemPrefix ? L(question.itemPrefix) : ''
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-6 shrink-0 text-right text-sm text-[var(--muted)]">{i + 1}.</span>
          {prefix && <span className="shrink-0 text-sm text-[var(--muted)]">{prefix}</span>}
          <input
            className={inputClass + ' py-1.5'}
            value={items[i] || ''}
            onChange={(e) => setItem(i, e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}

function Paired({ value, onChange }: InputProps) {
  const { t } = useLang()
  const v = (value as { describe?: string; feel?: string }) || {}
  return (
    <div className="flex flex-col gap-4">
      <label className="block text-left">
        <span className="mb-1 block text-sm font-medium text-[var(--muted)]">{t('describeLabel')}</span>
        <textarea
          className={inputClass + ' min-h-24 resize-y leading-relaxed'}
          value={v.describe || ''}
          onChange={(e) => onChange({ ...v, describe: e.target.value })}
          autoFocus
        />
      </label>
      <label className="block text-left">
        <span className="mb-1 block text-sm font-medium text-[var(--accent)]">{t('feelLabel')}</span>
        <textarea
          className={inputClass + ' min-h-24 resize-y leading-relaxed'}
          value={v.feel || ''}
          onChange={(e) => onChange({ ...v, feel: e.target.value })}
        />
      </label>
    </div>
  )
}

function RoleGrid({ value, onChange, question, roles }: InputProps) {
  const { t } = useLang()
  const L = useL()
  const rows = question.rows || 4
  const list = (value as { name: string; role: string }[]) || Array(rows).fill({ name: '', role: '' })
  const setRow = (i: number, patch: Partial<{ name: string; role: string }>) => {
    const next = list.map((r) => ({ ...r }))
    while (next.length < rows) next.push({ name: '', role: '' })
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-lg border border-[var(--line)] bg-white p-3 sm:flex-row sm:items-center">
          <span className="shrink-0 text-sm font-medium text-[var(--muted)]">
            {t('personN')} {i + 1}
          </span>
          <input
            className={inputClass + ' py-1.5'}
            placeholder={t('namePlaceholder')}
            value={list[i]?.name || ''}
            onChange={(e) => setRow(i, { name: e.target.value })}
          />
          <select
            className={inputClass + ' py-1.5 sm:w-56'}
            value={list[i]?.role || ''}
            onChange={(e) => setRow(i, { role: e.target.value })}
          >
            <option value="">{t('roleChoose')}</option>
            {Object.entries(roles).map(([key, label]) => (
              <option key={key} value={key}>
                {L(label)}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}

const registry: Record<string, (p: InputProps) => React.JSX.Element> = {
  text: TextInput,
  longtext: LongTextInput,
  statement: StatementInput,
  fields: FieldsInput,
  single_choice: SingleChoice,
  multi_choice: MultiChoice,
  percentage: Percentage,
  list: ListInput,
  paired: Paired,
  role_grid: RoleGrid,
}

export function QuestionInput(props: InputProps) {
  const Comp = registry[props.question.type] || LongTextInput
  return <Comp {...props} />
}
