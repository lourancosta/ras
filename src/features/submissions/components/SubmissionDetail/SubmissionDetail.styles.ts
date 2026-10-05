import styled from 'styled-components'
import { Card } from '../../../../components/ui'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const Section = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
`

export const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

export const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.brand};
`

export const Meta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.95rem;
`

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.brand};
`

export const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`

export const Item = styled.li`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`

export const Answer = styled.span<{ $ok: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: ${({ theme, $ok }) => ($ok ? theme.colors.success : theme.colors.danger)};
`

// pre-wrap keeps the line breaks the framer typed.
export const Notes = styled.p`
  margin: 0;
  white-space: pre-wrap;
`

export const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;

  img {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radius};
  }
`
