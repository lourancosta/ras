import type { Tables } from './database.types'

// The 8 checklist columns of `submissions` (see 0001_schema.sql).
export type ChecklistKey = keyof Pick<
  Tables<'submissions'>,
  | 'ppe_hard_hat'
  | 'ppe_vest'
  | 'ppe_boots'
  | 'ppe_eye_protection'
  | 'fall_protection'
  | 'ladders_inspected'
  | 'tools_cords_ok'
  | 'hazards_identified'
>

export type ChecklistAnswers = Record<ChecklistKey, boolean>

type ChecklistGroup = {
  title: string
  items: { key: ChecklistKey; label: string }[]
}

// Labels shown on the form (and later on the detail views), grouped as on paper.
export const checklistGroups: ChecklistGroup[] = [
  {
    title: 'PPE worn',
    items: [
      { key: 'ppe_hard_hat', label: 'Hard hat' },
      { key: 'ppe_vest', label: 'High-visibility vest' },
      { key: 'ppe_boots', label: 'Safety boots' },
      { key: 'ppe_eye_protection', label: 'Eye protection' },
    ],
  },
  {
    title: 'Site checks',
    items: [
      { key: 'fall_protection', label: 'Fall protection in place' },
      { key: 'ladders_inspected', label: 'Ladders / scaffolding inspected' },
      { key: 'tools_cords_ok', label: 'Tools and cords in good condition' },
      { key: 'hazards_identified', label: 'Hazards identified' },
    ],
  },
]

// Starting answers: everything "No" until the framer confirms it.
export const emptyChecklist: ChecklistAnswers = {
  ppe_hard_hat: false,
  ppe_vest: false,
  ppe_boots: false,
  ppe_eye_protection: false,
  fall_protection: false,
  ladders_inspected: false,
  tools_cords_ok: false,
  hazards_identified: false,
}

// All 8 keys in display order.
export const checklistKeys: ChecklistKey[] = checklistGroups.flatMap((group) =>
  group.items.map((item) => item.key),
)

// Number of items answered "No" (= reported as not in place).
export function countIssues(answers: ChecklistAnswers): number {
  return checklistKeys.filter((key) => !answers[key]).length
}
