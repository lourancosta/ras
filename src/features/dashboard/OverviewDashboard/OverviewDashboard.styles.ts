import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const NameList = styled.ul`
  margin: 0;
  padding-left: 20px;

  a {
    color: ${({ theme }) => theme.colors.text};
  }
`

export const SiteGroup = styled.div`
  display: flex;
  flex-direction: column;
  padding: 6px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`
