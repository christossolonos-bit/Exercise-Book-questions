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
    signupIntro: 'Ξεκίνα το ταξίδι σου. Χρειάζεσαι μόνο ένα email κι έναν κωδικό πρόσβασης.',
    name: 'Όνομα',
    email: 'Email',
    password: 'Κωδικός πρόσβασης',
    signupBtn: 'Δημιουργία λογαριασμού',

    // Log in
    loginTitle: 'Καλώς ήρθες πάλι',
    loginBtn: 'Σύνδεση',
    login: 'Σύνδεση',
    logout: 'Αποσύνδεση',

    // Forgot / reset password
    forgotLink: 'Ξέχασες τον κωδικό σου;',
    forgotTitle: 'Επαναφορά κωδικού',
    forgotIntro: 'Γράψε το email σου και θα σου στείλουμε έναν σύνδεσμο για να ορίσεις νέο κωδικό.',
    forgotBtn: 'Στείλε μου σύνδεσμο',
    forgotSent: 'Αν υπάρχει λογαριασμός με αυτό το email, σου στείλαμε έναν σύνδεσμο επαναφοράς. Έλεγξε τα εισερχόμενά σου.',
    resetTitle: 'Όρισε νέο κωδικό',
    resetIntro: 'Διάλεξε έναν νέο κωδικό για τον λογαριασμό σου.',
    newPassword: 'Νέος κωδικός',
    resetBtn: 'Αποθήκευση κωδικού',
    resetDone: 'Ο κωδικός σου άλλαξε! Μπορείς να συνδεθείς τώρα.',
    backToLogin: '← Στη σύνδεση',

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
    deleteAnswers: 'Διαγραφή απαντήσεων',
    deleteTitle: 'Να διαγραφούν οι απαντήσεις σου;',
    deleteBody: 'Αυτό θα διαγράψει οριστικά όλες τις απαντήσεις σου από το προφίλ σου. Όποιο PDF έχεις ήδη κατεβάσει παραμένει στη συσκευή σου.',
    keepThem: 'Άκυρο',
    confirmDelete: 'Ναι, διάγραψέ τες',
    deleting: 'Διαγραφή…',

    // Admin
    navAdmin: 'Διαχείριση',
    adminTitle: 'Χρήστες',
    adminIntro: 'Όλοι όσοι έχουν λογαριασμό και η πρόοδός τους.',
    adminPrivacyNote: 'Οι απαντήσεις των χρηστών είναι ιδιωτικές και δεν εμφανίζονται εδώ.',
    adminAnswered: 'απαντήσεις',
    adminJoined: 'Εγγραφή',
    adminNoUsers: 'Δεν υπάρχουν χρήστες ακόμα.',

    // Errors (mapped from server error codes)
    err_missing_fields: 'Συμπλήρωσε όλα τα πεδία.',
    err_weak_password: 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.',
    err_email_taken: 'Υπάρχει ήδη λογαριασμός με αυτό το email.',
    err_bad_credentials: 'Λάθος email ή κωδικός.',
    err_invalid_or_expired: 'Ο σύνδεσμος δεν είναι έγκυρος ή έχει λήξει. Ζήτησε νέον.',
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
    signupIntro: 'Begin your journey. All you need is an email and a password.',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    signupBtn: 'Create account',

    // Log in
    loginTitle: 'Welcome back',
    loginBtn: 'Log in',
    login: 'Log in',
    logout: 'Log out',

    // Forgot / reset password
    forgotLink: 'Forgot your password?',
    forgotTitle: 'Reset your password',
    forgotIntro: "Enter your email and we'll send you a link to set a new password.",
    forgotBtn: 'Send me a link',
    forgotSent: "If an account exists for that email, we've sent a reset link. Check your inbox.",
    resetTitle: 'Set a new password',
    resetIntro: 'Choose a new password for your account.',
    newPassword: 'New password',
    resetBtn: 'Save password',
    resetDone: 'Your password has been changed! You can log in now.',
    backToLogin: '← Back to log in',

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
    deleteAnswers: 'Delete my answers',
    deleteTitle: 'Delete your answers?',
    deleteBody: 'This permanently removes all your answers from your profile. Any PDF you have already downloaded stays on your device.',
    keepThem: 'Cancel',
    confirmDelete: 'Yes, delete them',
    deleting: 'Deleting…',

    // Admin
    navAdmin: 'Admin',
    adminTitle: 'Users',
    adminIntro: 'Everyone with an account and their progress.',
    adminPrivacyNote: "Users' answers are private and are not shown here.",
    adminAnswered: 'answers',
    adminJoined: 'Joined',
    adminNoUsers: 'No users yet.',

    // Errors (mapped from server error codes)
    err_missing_fields: 'Please fill in every field.',
    err_weak_password: 'Password must be at least 6 characters.',
    err_email_taken: 'An account with this email already exists.',
    err_bad_credentials: 'Wrong email or password.',
    err_invalid_or_expired: 'This link is invalid or has expired. Please request a new one.',
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
