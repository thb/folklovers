import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/songs/new')({
  beforeLoad: () => {
    throw redirect({ to: '/covers/new' })
  },
  component: () => null,
})
