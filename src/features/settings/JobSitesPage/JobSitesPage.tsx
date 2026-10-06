import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DataTable, type Column } from '../../../components/DataTable/DataTable'
import { Modal } from '../../../components/Modal/Modal'
import {
  Button,
  ErrorMessage,
  Hint,
  ListPage,
  PageHeader,
  PageTitle,
  Pill,
  SuccessMessage,
} from '../../../components/ui'
import { SiteForm } from '../components/SiteForm/SiteForm'
import { fetchSites, type Site } from '../sites'
import { useAsync } from '../../../lib/useAsync'

// `card` = where each column goes on a phone card; unmarked columns are the detail line.
const columns: Column<Site>[] = [
  { header: 'Name', cell: (site) => site.name, card: 'title' },
  { header: 'Address', cell: (site) => site.address ?? '—' },
  {
    header: 'Status',
    // Inactive sites keep their history but can't be picked on new forms.
    cell: (site) =>
      site.is_active ? <Pill $tone="success">Active</Pill> : <Pill $tone="muted">Inactive</Pill>,
    card: 'badge',
  },
]

// Which modal is open: none, "new site", or "edit this site".
type ModalState = { mode: 'create' } | { mode: 'edit'; site: Site } | null

// /settings/sites (admin): every job site. "New site" and clicking a row open a modal
// with the form (create / edit name, address and status).
export function JobSitesPage() {
  const {
    data: sites, // null while loading
    error: loadError,
    setData: setSites,
  } = useAsync('sites', fetchSites, 'Could not load the sites. Please refresh the page.')
  const [modal, setModal] = useState<ModalState>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function openModal(next: Exclude<ModalState, null>) {
    setSuccess(null)
    setModal(next)
  }

  // Put the saved site in the list (added, or replacing its old version), kept A to Z,
  // without reloading the page.
  function handleSaved(saved: Site) {
    const wasEdit = modal?.mode === 'edit'
    setSites((current) =>
      [...current.filter((site) => site.id !== saved.id), saved].sort((a, b) => a.name.localeCompare(b.name)),
    )
    setModal(null)
    setSuccess(wasEdit ? `"${saved.name}" was updated.` : `"${saved.name}" was added.`)
  }

  const activeCount = sites?.filter((site) => site.is_active).length ?? 0
  // e.g. "5 sites (4 active)"; "Loading…" until the list arrives; nothing if it failed.
  const countText = sites
    ? `${sites.length} site${sites.length === 1 ? '' : 's'} (${activeCount} active)`
    : loadError
      ? null
      : 'Loading…'

  return (
    <ListPage>
      <PageHeader>
        <PageTitle>Job sites</PageTitle>
        <Button type="button" onClick={() => openModal({ mode: 'create' })}>
          <Plus size={18} aria-hidden="true" /> New site
        </Button>
      </PageHeader>

      {modal && (
        <Modal
          title={modal.mode === 'edit' ? 'Edit job site' : 'New job site'}
          onClose={() => setModal(null)}
        >
          <SiteForm
            site={modal.mode === 'edit' ? modal.site : undefined}
            existingNames={sites?.map((site) => site.name) ?? []}
            onSaved={handleSaved}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      {loadError && <ErrorMessage>{loadError}</ErrorMessage>}

      {countText && <Hint>{countText}</Hint>}

      <DataTable
        columns={columns}
        rows={sites ?? []}
        rowKey={(site) => site.id}
        onRowClick={(site) => openModal({ mode: 'edit', site })}
        rowLabel={(site) => `Edit site: ${site.name}`}
        emptyMessage={sites ? 'No job sites yet. Add the first one with "New site".' : undefined}
      />
    </ListPage>
  )
}
