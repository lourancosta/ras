import { useLocation, useSearchParams } from 'react-router'

// List filters kept in the URL query string (?site=..&status=..): they survive a refresh,
// work with the browser's Back button, and a link can open a filtered list.
// The page reads its values from `params` (each page parses them its own way) and changes
// them with setFilter / setFilters / clear. No filter state in the page.
export function useUrlFilters() {
  const [params, setParams] = useSearchParams()
  const { pathname } = useLocation()

  // The whole query string, e.g. "site=abc&status=flagged" ('' = no filters).
  // Changes whenever any filter changes, so it works as a useAsync key.
  const key = params.toString()
  const hasFilters = key !== ''

  // Set several parameters at once; '' or null removes one. `replace`: changing a filter
  // doesn't add a history entry, so Back leaves the page instead of undoing filters.
  function setFilters(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params)
    for (const [name, value] of Object.entries(changes)) {
      if (value) next.set(name, value)
      else next.delete(name)
    }
    setParams(next, { replace: true })
  }

  return {
    params,
    key,
    hasFilters,
    activeCount: [...params.keys()].length, // shown on the phone filter panel: "Filters (2)"
    // This list's URL with its filters. Detail pages get it as `state.back`, so their
    // Back link returns to the same filtered list.
    listUrl: hasFilters ? `${pathname}?${key}` : pathname,
    setFilter: (name: string, value: string) => setFilters({ [name]: value }),
    setFilters,
    clear: () => setParams({}, { replace: true }),
  }
}
