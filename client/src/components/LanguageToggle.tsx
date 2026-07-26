import { useLang, type Lang } from '../i18n'

// Flag-style pills. Using the country emoji keeps it dependency-free and crisp on every device.
const options: { lang: Lang; flag: string; label: string }[] = [
  { lang: 'el', flag: '🇬🇷', label: 'ΕΛ' },
  { lang: 'en', flag: '🇬🇧', label: 'EN' },
]

export function LanguageToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="ui inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-white/60 p-1">
      {options.map((o) => {
        const active = o.lang === lang
        return (
          <button
            key={o.lang}
            onClick={() => setLang(o.lang)}
            aria-pressed={active}
            className={
              'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ' +
              (active
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--muted)] hover:bg-[var(--accent-soft)]')
            }
          >
            <span className="text-base leading-none">{o.flag}</span>
            <span>{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
