import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Music, Disc } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
  beforeLoad: ({ context }) => {
    // This will be checked client-side, server redirect not possible without SSR auth
  },
})

function AdminDashboard() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Administration
          </h1>
          <p className="text-muted-foreground">
            Gérez les chansons et les interprétations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/admin/songs">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Chansons</CardTitle>
                <CardDescription>
                  Ajouter, modifier ou supprimer des chansons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gérez la collection de chansons folk originales
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/covers">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Disc className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Interprétations</CardTitle>
                <CardDescription>
                  Ajouter, modifier ou supprimer des covers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gérez les différentes versions et reprises
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
