import type { ReactNode } from 'react'
import styled from 'styled-components'

// Centered message for whole-page states: loading, errors, "not allowed".
export function FullPageMessage({ children }: { children: ReactNode }) {
  return <Wrapper>{children}</Wrapper>
}

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
`
