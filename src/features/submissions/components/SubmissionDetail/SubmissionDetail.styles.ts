import styled from 'styled-components'
import { Card } from '../../../../components/ui'
import { MAX_PHOTOS } from '../../photos'

// The layout follows the space this component gets, not the window: on the detail page
// (wide) it uses two columns, in the review queue modal (760px) it stays one column.
// container-type makes Wrapper a "container"; @container rules below measure its width.
export const Wrapper = styled.div`
  container-type: inline-size;
`

// Narrow: everything in one column (the phone layout).
// Wide (900px+): header and review across the top, then the checklist on the left and
// notes + photos on the right.
export const Layout = styled.div`
  display: grid;
  gap: 16px;

  @container (min-width: 900px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas:
      'header header'
      'review review'
      'checks media';
    align-items: start;
  }
`

// One grid area (header, review, checks, media); stacks its sections.
export const Area = styled.div<{ $area: 'header' | 'review' | 'checks' | 'media' }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;

  @container (min-width: 900px) {
    grid-area: ${({ $area }) => $area};
  }
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

// Narrow: one detail per line. Wide: side by side, wrapping when they don't fit.
export const Meta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.95rem;

  @container (min-width: 900px) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px 32px;
  }
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

// Same as the photo picker: one column per allowed photo, so all 5 fit in one row.
export const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${MAX_PHOTOS}, minmax(0, 1fr));
  gap: 8px;

  img {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radius};
  }
`
