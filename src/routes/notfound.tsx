import { createFileRoute } from '@tanstack/react-router'

function NotFound() {
  return <div>Hello "/notfound"!</div>
}

export const Route = createFileRoute('/notfound')({
  component: NotFound,
});