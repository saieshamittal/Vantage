import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/60 px-6 py-6">
      <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <BrandLogo logoClassName="h-12 w-auto" />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Product</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <a href="/#features" className="block hover:text-foreground transition-colors">Features</a>
            <a href="/#pricing" className="block hover:text-foreground transition-colors">Pricing</a>
            <a href="/#about" className="block hover:text-foreground transition-colors">About</a>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Contact</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Vantage HQ</p>
            <p>support@vantage.com</p>
            <p>+1 (800) 555-0147</p>
            <p>Mon - Fri, 9:00 AM - 6:00 PM</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Company</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/login" className="block hover:text-foreground transition-colors">Sign In</Link>
            <Link to="/register" className="block hover:text-foreground transition-colors">Get Started</Link>
            <a href="mailto:support@vantage.com" className="block hover:text-foreground transition-colors">Email Support</a>
            <a href="tel:+18005550147" className="block hover:text-foreground transition-colors">Call Us</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>2026 Vantage. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="mailto:support@vantage.com" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}
