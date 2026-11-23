import FrontendLayout from './(frontend)/layout'
import NotFound, { metadata } from './(frontend)/not-found'

export { metadata }

export default function GlobalNotFound() {
  return (
    <FrontendLayout>
      <NotFound />
    </FrontendLayout>
  )
}
