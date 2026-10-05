import { Link, useLocation, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import styled from 'styled-components'
import { SubmissionDetail } from '../components/SubmissionDetail'
import { PageTitle } from '../components/ui'

type SubmissionDetailPageProps = {
  backTo: string // where "Back" goes by default
  backLabel: string
  canReview?: boolean // admin: show the review actions
}

// One submission. Used by framers (/forms/:id) and admins (/admin/forms/:id).
// The admin table passes `state.back` (the dashboard URL with its filters),
// so going back keeps the filters the admin had set.
export function SubmissionDetailPage({ backTo, backLabel, canReview = false }: SubmissionDetailPageProps) {
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
      <SubmissionDetail key={id} id={id} canReview={canReview} />
    </Container>
  )
}

const Container = styled.div`
  max-width: 640px;
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.brand};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`
