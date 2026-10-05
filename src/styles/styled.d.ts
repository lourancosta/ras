// Tells TypeScript the shape of `props.theme` inside styled components.
import 'styled-components'
import type { AppTheme } from './theme'

declare module 'styled-components' {
  // Empty on purpose: this is how styled-components merges our theme type in.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends AppTheme {}
}
