import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'el' | 'en'

// UI chrome strings (the questions themselves carry their own el/en text in the data).
const dict = {
  el: {
    appTitle: 'Ποιός / Ποιά Είσαι;',
    appSubtitle: 'Το ψηφιακό τετράδιο του βιβλίου',
    tagline: 'Ένα προσωπικό ταξίδι αυτογνωσίας — μία ερώτηση κάθε φορά.',
    begin: 'Ξεκίνα',
    haveAccount: 'Έχεις ήδη λογαριασμό;',
    noAccount: 'Δεν έχεις λογαριασμό;',

    // Sign up
    signupTitle: 'Δημιούργησε τον λογαριασμό σου',
    signupIntro: 'Χρησιμοποίησε τον κωδικό που βρίσκεται μέσα στο βιβλίο σου.',
    name: 'Όνομα',
    email: 'Email',
    password: 'Κωδικός πρόσβασης',
    accessCode: 'Κωδικός βιβλίου',
    accessCodePlaceholder: 'π.χ. WAYW-XXXX-XXXX',
    signupBtn: 'Δημιουργία λογαριασμού',
    codeValid: 'Ο κωδικός είναι έγκυρος ✓',
    codeChecking: 'Έλεγχος κωδικού…',

    // Log in
    loginTitle: 'Καλώς ήρθες πάλι',
    loginBtn: 'Σύνδεση',
    login: 'Σύνδεση',
    logout: 'Αποσύνδεση',

    // Workbook home
    welcome: 'Καλώς ήρθες',
    yourWorkbook: 'Το τετράδιό σου',
    startWorkbook: 'Ξεκίνα το τετράδιο',
    continueWorkbook: 'Συνέχισε',
    answeredProgress: 'απαντήθηκαν',

    // Question flow
    back: 'Πίσω',
    next: 'Επόμενη',
    finish: 'Ολοκλήρωση',
    saving: 'Αποθήκευση…',
    saved: 'Αποθηκεύτηκε',
    saveError: 'Σφάλμα αποθήκευσης',
    loadingQuestions: 'Φόρτωση ερωτήσεων…',
    feelLabel: 'Τι θα αισθάνομαι;',
    describeLabel: 'Περιγραφή',
    namePlaceholder: 'Όνομα',
    roleChoose: 'Διάλεξε ρόλο',
    personN: 'Άτομο',
    optional: 'προαιρετικό',
    doneTitle: 'Μπράβο σου!',
    doneText: 'Έφτασες στο τέλος. Μπορείς να επιστρέψεις όποτε θέλεις και να αλλάξεις τις απαντήσεις σου.',
    reviewAnswers: 'Δες τις απαντήσεις σου',
    backToStart: 'Στην αρχή',

    // Navigation + review page
    navWorkbook: 'Το τετράδιο',
    navReview: 'Οι απαντήσεις μου',
    reviewTitle: 'Οι απαντήσεις μου',
    reviewIntro: 'Όλες οι ερωτήσεις και οι απαντήσεις σου, μαζεμένες σε ένα μέρος.',
    noAnswerYet: '(χωρίς απάντηση ακόμα)',
    exportPdf: 'Εξαγωγή σε PDF (A4)',
    reviewEmpty: 'Δεν έχεις απαντήσει ακόμα σε καμία ερώτηση.',
    goAnswer: 'Ξεκίνα να απαντάς',
    continueEditing: 'Συνέχισε το τετράδιο',
    pdfFor: 'Τετράδιο του/της',
    generatedOn: 'Δημιουργήθηκε',
    preparingPdf: 'Προετοιμασία PDF…',

    // Errors (mapped from server error codes)
    err_missing_fields: 'Συμπλήρωσε όλα τα πεδία.',
    err_weak_password: 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.',
    err_code_invalid: 'Ο κωδικός βιβλίου δεν είναι έγκυρος.',
    err_code_used: 'Αυτός ο κωδικός έχει ήδη χρησιμοποιηθεί.',
    err_email_taken: 'Υπάρχει ήδη λογαριασμός με αυτό το email.',
    err_bad_credentials: 'Λάθος email ή κωδικός.',
    err_generic: 'Κάτι πήγε στραβά. Δοκίμασε ξανά.',

    loadingApp: 'Φόρτωση…',
  },
  en: {
    appTitle: 'Who Are You?',
    appSubtitle: 'The digital workbook of the book',
    tagline: 'A personal journey of self-discovery — one question at a time.',
    begin: 'Begin',
    haveAccount: 'Already have an account?',
    noAccount: "Don't have an account?",

    // Sign up
    signupTitle: 'Create your account',
    signupIntro: 'Use the code printed inside your book.',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    accessCode: 'Book code',
    accessCodePlaceholder: 'e.g. WAYW-XXXX-XXXX',
    signupBtn: 'Create account',
    codeValid: 'Code is valid ✓',
    codeChecking: 'Checking code…',

    // Log in
    loginTitle: 'Welcome back',
    loginBtn: 'Log in',
    login: 'Log in',
    logout: 'Log out',

    // Workbook home
    welcome: 'Welcome',
    yourWorkbook: 'Your workbook',
    startWorkbook: 'Start the workbook',
    continueWorkbook: 'Continue',
    answeredProgress: 'answered',

    // Question flow
    back: 'Back',
    next: 'Next',
    finish: 'Finish',
    saving: 'Saving…',
    saved: 'Saved',
    saveError: 'Save failed',
    loadingQuestions: 'Loading questions…',
    feelLabel: 'What will I feel?',
    describeLabel: 'Describe',
    namePlaceholder: 'Name',
    roleChoose: 'Choose a role',
    personN: 'Person',
    optional: 'optional',
    doneTitle: 'Well done!',
    doneText: "You've reached the end. You can come back any time and change your answers.",
    reviewAnswers: 'Review your answers',
    backToStart: 'Back to start',

    // Navigation + review page
    navWorkbook: 'Workbook',
    navReview: 'My answers',
    reviewTitle: 'My answers',
    reviewIntro: 'All your questions and answers, gathered in one place.',
    noAnswerYet: '(no answer yet)',
    exportPdf: 'Export to PDF (A4)',
    reviewEmpty: "You haven't answered any questions yet.",
    goAnswer: 'Start answering',
    continueEditing: 'Continue the workbook',
    pdfFor: 'Workbook of',
    generatedOn: 'Generated',
    preparingPdf: 'Preparing PDF…',

    // Errors (mapped from server error codes)
    err_missing_fields: 'Please fill in every field.',
    err_weak_password: 'Password must be at least 6 characters.',
    err_code_invalid: 'That book code is not valid.',
    err_code_used: 'This code has already been used.',
    err_email_taken: 'An account with this email already exists.',
    err_bad_credentials: 'Wrong email or password.',
    err_generic: 'Something went wrong. Please try again.',

    loadingApp: 'Loading…',
  },
} as const

export type StringKey = keyof (typeof dict)['el']

type LangCtx = {
  lang: Lang
  setLang: (l: Lang) => void
  toggle: () => void
  t: (key: StringKey) => string
}

const Ctx = createContext<LangCtx | null>(null)
const STORAGE_KEY = 'wayw.lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'en' || saved === 'el' ? saved : 'el'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (l: Lang) => setLangState(l)
  const toggle = () => setLangState((p) => (p === 'el' ? 'en' : 'el'))
  const t = (key: StringKey) => dict[lang][key]

  return <Ctx.Provider value={{ lang, setLang, toggle, t }}>{children}</Ctx.Provider>
}

// Map a server error code to a friendly, translated message.
// eslint-disable-next-line react-refresh/only-export-components
export function errorKey(code: string): StringKey {
  const key = `err_${code}` as StringKey
  return key in dict.el ? key : 'err_generic'
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>')
  return ctx
}
