import { useEffect, useState } from 'react'
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
import { useAuth } from '../../auth/auth-context'
import { WorkerForm } from '../components/WorkerForm/WorkerForm'
import { ROLE_LABELS } from '../roles'
import { fetchWorkers, type Worker } from '../workers'

// `card` = where each column goes on a phone card; unmarked columns are the detail line.
const columns: Column<Worker>[] = [
  { header: 'Name', cell: (worker) => worker.full_name, card: 'title' },
  { header: 'Email', cell: (worker) => worker.email ?? '—' },
  { header: 'Role', cell: (worker) => ROLE_LABELS[worker.role] },
  {
    header: 'Status',
    cell: (worker) =>
      worker.is_active ? <Pill $tone="success">Active</Pill> : <Pill $tone="muted">Inactive</Pill>,
    card: 'badge',
  },
]

// Which modal is open: none, "new worker", or "edit this worker".
type ModalState = { mode: 'create' } | { mode: 'edit'; worker: Worker } | null

// /settings/workers (admin): every account. "New worker" and clicking a row open a
// modal with the form (create / edit name, email, role, status, password).
export function WorkersPage() {
  const { profile } = useAuth()
  const [workers, setWorkers] = useState<Worker[] | null>(null) // null = loading
  const [loadError, setLoadError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchWorkers()
      .then(setWorkers)
      .catch((err) => {
        console.error('Loading workers failed:', err)
        setLoadError('Could not load the workers. Please refresh the page.')
      })
  }, [])

  function openModal(next: Exclude<ModalState, null>) {
    setSuccess(null)
    setModal(next)
  }

  // Put the saved account in the list (added, or replacing its old version), kept A to Z,
  // without reloading the page.
  function handleSaved(saved: Worker) {
    const wasEdit = modal?.mode === 'edit'
    setWorkers((current) =>
      [...(current ?? []).filter((worker) => worker.id !== saved.id), saved].sort((a, b) =>
        a.full_name.localeCompare(b.full_name),
      ),
    )
    setModal(null)
    setSuccess(
      wasEdit
        ? `${saved.full_name} was updated.`
        : `Account created for ${saved.full_name}. Give them their email and temporary password.`,
    )
  }

  const activeCount = workers?.filter((worker) => worker.is_active).length ?? 0
  // e.g. "7 people (6 active)"; "Loading…" until the list arrives; nothing if it failed.
  const countText = workers
    ? `${workers.length} ${workers.length === 1 ? 'person' : 'people'} (${activeCount} active)`
    : loadError
      ? null
      : 'Loading…'

  return (
    <ListPage>
      <PageHeader>
        <PageTitle>Workers</PageTitle>
        <Button type="button" onClick={() => openModal({ mode: 'create' })}>
          <Plus size={18} aria-hidden="true" /> New worker
        </Button>
      </PageHeader>

      {modal && (
        <Modal title={modal.mode === 'edit' ? 'Edit worker' : 'New worker'} onClose={() => setModal(null)}>
          <WorkerForm
            worker={modal.mode === 'edit' ? modal.worker : undefined}
            isSelf={modal.mode === 'edit' && modal.worker.id === profile?.id}
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
        rows={workers ?? []}
        rowKey={(worker) => worker.id}
        onRowClick={(worker) => openModal({ mode: 'edit', worker })}
        rowLabel={(worker) => `Edit worker: ${worker.full_name}`}
        emptyMessage={workers ? 'No workers yet.' : undefined}
      />
    </ListPage>
  )
}
