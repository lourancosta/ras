import type { ReactNode } from 'react'
import { Wrapper } from './FullPageMessage.styles'

// Centered message for whole-page states: loading, errors, "not allowed".
export function FullPageMessage({ children }: { children: ReactNode }) {
  return <Wrapper>{children}</Wrapper>
}
