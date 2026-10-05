import type { LucideIcon } from 'lucide-react'
import { TileLabel, TileLink, TileValue } from './Tile.styles'

// The grid that holds the tiles, so pages import both from here.
export { Tiles } from './Tile.styles'

type TileProps = {
  to: string // where clicking the tile goes (e.g. the matching filtered list)
  icon: LucideIcon
  value: string
  label: string
  tone?: 'success' | 'danger'
}

// A big number with a label, used on both dashboards. Colour is never the only
// signal: the icon and label say the same thing (good for colour-blind users).
export function Tile({ to, icon: Icon, value, label, tone }: TileProps) {
  return (
    <TileLink to={to} $tone={tone}>
      <Icon size={22} aria-hidden="true" />
      <TileValue>{value}</TileValue>
      <TileLabel>{label}</TileLabel>
    </TileLink>
  )
}
