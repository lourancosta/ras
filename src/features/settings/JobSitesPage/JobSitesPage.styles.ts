import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

// Title on the left, "New site" button on the right (wraps under it if there's no room).
export const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h1 {
    margin: 0; /* the Container's gap already spaces it */
  }
`
