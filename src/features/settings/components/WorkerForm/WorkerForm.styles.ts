import styled from 'styled-components'

// Password input with the "Generate" button next to it.
export const PasswordRow = styled.div`
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    min-width: 0;
    font-family: ui-monospace, monospace; /* easier to read out / copy: l vs 1, O vs 0 */
  }
`
