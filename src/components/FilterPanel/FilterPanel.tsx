import { useId, useState, type ReactNode } from 'react'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useTheme } from 'styled-components'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { FilterCard } from '../ui'
import { Chevron, HeaderLabel, PanelBody, PanelCard, PanelHeader } from './FilterPanel.styles'

type FilterPanelProps = {
  activeCount: number // how many filters are set, shown on the phone button ("Filters (2)")
  children: ReactNode // the filter fields
}

// The filter fields of a list page. Wide screens: always shown, side by side.
// Phones: one card whose header ("Filters (2)" + chevron) shows / hides the fields below it,
// one per row, so they don't push the list far down. Starts closed; the count says if any
// filter is on.
export function FilterPanel({ activeCount, children }: FilterPanelProps) {
  const theme = useTheme()
  const isWide = useMediaQuery(`(min-width: ${theme.breakpoints.md})`)
  const [open, setOpen] = useState(false)
  const panelId = useId() // links the button to the panel it controls (aria-controls)

  if (isWide) return <FilterCard>{children}</FilterCard>

  return (
    <PanelCard>
      <PanelHeader type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={panelId}>
        <HeaderLabel>
          <SlidersHorizontal size={18} aria-hidden="true" />
          Filters
          {activeCount > 0 && ` (${activeCount})`}
        </HeaderLabel>
        <Chevron $open={open}>
          <ChevronDown size={18} aria-hidden="true" />
        </Chevron>
      </PanelHeader>
      {/* Always rendered (hidden when closed) so aria-controls points at a real element. */}
      <PanelBody id={panelId} hidden={!open}>
        {children}
      </PanelBody>
    </PanelCard>
  )
}
