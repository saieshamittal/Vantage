import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import BrandLogo from '../components/layout/BrandLogo'
import SiteFooter from '../components/layout/SiteFooter'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <BrandLogo logoClassName="h-14 w-auto" align="center" />
          </div>
          <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-accent transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
