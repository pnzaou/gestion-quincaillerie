import Link from "next/link"

const NotFound = () => {
    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-6xl font-bold tracking-tight text-foreground sm:text-7xl">404</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Oups, il semble que la page que vous recherchez n'existe pas.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-md bg-[#0084D1] hover:bg-[#0042d1] px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0042d1] focus:ring-offset-2"
                prefetch={false}
              >
                Retour au dashboard
              </Link>
            </div>
          </div>
        </div>
      );
}

export default NotFound;
