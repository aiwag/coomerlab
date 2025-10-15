import { createFileRoute } from '@tanstack/react-router'
import TorrentPlayer from '../components/torrentplayer/TorrentPlayer'

export const Route = createFileRoute('/TorrentPlayer')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TorrentPlayer />
}