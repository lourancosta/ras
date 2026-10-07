import { useEffect, useEffectEvent, useState } from 'react'

// Outcome of one load, tagged with the key it was for.
type Loaded<T> = { key: string; data: T | null; error: string | null }

// Loads data when a page (or component) shows, and again every time `key` changes.
//
//   const { data, error, loading, setData } = useAsync(
//     filterKey,                                  // what the data depends on, as a string
//     () => fetchSubmissions(filters),            // the request
//     'Could not load forms. Please refresh the page.',
//   )
//
// - key: must change whenever the request would return something different (filters in
//   the URL, an id, a user id...). Use a fixed name ('sites') to load once.
//   null = don't load yet (e.g. the user id isn't known): `loading` stays true.
// - loading is derived: true until there's a result for the *current* key, so rows or
//   errors from an older key are never shown (no setState in the effect body).
// - A slower, older response that arrives after a newer key started is dropped (`ignore`).
// - Errors: the real one goes to the console, the page gets `errorMessage` (friendly).
// - setData: change the loaded data in place (e.g. after a save), without reloading.
// - reload: ask the server again with the same key (e.g. after creating a form). The old
//   data stays on screen until the new data arrives, so the list doesn't flash "Loading…".
export function useAsync<T>(key: string | null, load: () => Promise<T>, errorMessage: string) {
  const [loaded, setLoaded] = useState<Loaded<T> | null>(null)
  // Bumped by reload(): a new value re-runs the effect below with the same key.
  const [version, setVersion] = useState(0)

  // useEffectEvent: the effect always calls the latest `load` (with the latest filters)
  // without `load` being a dependency. A new function is created on every render, so as
  // a dependency it would reload every render; `key` decides when to reload instead.
  const runLoad = useEffectEvent(load)

  useEffect(() => {
    if (key === null) return
    let ignore = false // the key changed (or we unmounted): drop this response
    runLoad()
      .then((data) => {
        if (!ignore) setLoaded({ key, data, error: null })
      })
      .catch((err) => {
        console.error(errorMessage, err)
        if (!ignore) setLoaded({ key, data: null, error: errorMessage })
      })
    return () => {
      ignore = true
    }
  }, [key, version, errorMessage])

  const current = loaded?.key === key ? loaded : null

  // Update the data we already have, e.g. one row after a review. Does nothing while loading.
  function setData(update: (data: T) => T) {
    setLoaded((previous) =>
      previous && previous.data !== null ? { ...previous, data: update(previous.data) } : previous,
    )
  }

  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: current === null,
    setData,
    reload: () => setVersion((v) => v + 1),
  }
}
