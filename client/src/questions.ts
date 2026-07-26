import { api } from './api'

export type LocalizedText = { el: string; en: string }
export type Option = { value: string; label: LocalizedText }
export type FieldDef = { key: string; label: LocalizedText }

export type QuestionType =
  | 'text'
  | 'longtext'
  | 'fields'
  | 'single_choice'
  | 'multi_choice'
  | 'percentage'
  | 'list'
  | 'paired'
  | 'role_grid'
  | 'statement'

export type Question = {
  id: string
  type: QuestionType
  section?: LocalizedText
  prompt: LocalizedText
  help?: LocalizedText
  placeholder?: LocalizedText
  options?: Option[]
  fields?: FieldDef[]
  listCount?: number
  itemPrefix?: LocalizedText
  rows?: number
}

export type Chapter = {
  id: string
  part: LocalizedText
  title: LocalizedText
  questions: Question[]
}

export type QuestionSet = {
  roles: Record<string, LocalizedText>
  yesno: Option[]
  chapters: Chapter[]
}

// One card in the linear flow, with its position and chapter context.
export type FlatItem = {
  question: Question
  chapter: Chapter
  index: number // 0-based position in the whole book
}

export async function loadQuestions(): Promise<QuestionSet> {
  return api<QuestionSet>('/questions', { auth: false })
}

export function flatten(set: QuestionSet): FlatItem[] {
  const items: FlatItem[] = []
  for (const chapter of set.chapters) {
    for (const question of chapter.questions) {
      items.push({ question, chapter, index: items.length })
    }
  }
  return items
}
