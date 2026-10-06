import { useLocation, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { SubmissionDetail } from '../components/SubmissionDetail/SubmissionDetail'
import { BackLink, PageTitle } from '../../../components/ui'
import { Container } from './SubmissionDetailPage.styles'

type SubmissionDetailPageProps = {
  backTo: string // where "Back" goes by default
  backLabel: string
}

// One submission. Used by framers (/my-submissions/:id) and admins (/submissions/:id).
// Both lists pass `state.back` (their URL with its filters), so going back keeps
// the filters that were set. Opened directly (no state): back goes to `backTo`.
export function SubmissionDetailPage({ backTo, backLabel }: SubmissionDetailPageProps) {
  const { id = '' } = useParams()
  const location = useLocation()
  const back = (location.state as { back?: string } | null)?.back ?? backTo

  return (
    <Container>
      <BackLink to={back}>
        <ArrowLeft size={18} aria-hidden="true" /> {backLabel}
      </BackLink>
      <PageTitle>Safety form</PageTitle>
      {/* key={id}: a new id remounts the component, so old data is never shown. */}
      <SubmissionDetail key={id} id={id} />
    </Container>
  )
}
