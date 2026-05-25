import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Shield, Zap, TrendingUp, Users, CheckCircle } from 'lucide-react'
import BrandLogo from '../components/layout/BrandLogo'
import SiteFooter from '../components/layout/SiteFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo logoClassName="h-20 w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="px-5 py-2.5 text-foreground hover:text-primary transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8">
              <Zap className="w-4 h-4" />
              <span>Powered by Advanced Analytics</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              <span className="text-foreground">Make </span>
              <span className="gradient-text">Smarter</span>
              <br />
              <span className="text-foreground">Decisions</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Vantage transforms your data into actionable insights. 
              Leverage AI-powered analytics to drive growth and stay ahead of the competition.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-accent transition-all glow flex items-center justify-center gap-2 group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#features" 
                className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold text-lg hover:bg-muted transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '500+', label: 'Companies Trust Us' },
              { value: '2.5M+', label: 'Data Points Analyzed' },
              { value: '99.9%', label: 'Uptime Guarantee' },
              { value: '4.9/5', label: 'Customer Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-card border border-border">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to transform your data into strategic advantages
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: 'Real-time Analytics',
                description: 'Monitor your key metrics in real-time with beautiful, intuitive dashboards.'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-grade encryption and compliance with SOC 2, GDPR, and HIPAA standards.'
              },
              {
                icon: TrendingUp,
                title: 'Predictive Insights',
                description: 'AI-powered forecasting to help you anticipate trends before they happen.'
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Share insights and collaborate with your team in real-time.'
              },
              {
                icon: Zap,
                title: 'Instant Reports',
                description: 'Generate comprehensive reports with a single click, ready for stakeholders.'
              },
              {
                icon: CheckCircle,
                title: 'Custom Integrations',
                description: 'Connect with 100+ tools you already use, from CRM to data warehouses.'
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Pick the plan that matches your team size and reporting needs.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                name: 'Starter',
                price: '$29',
                desc: 'Great for small teams getting organized.',
                features: ['Inventory tracking', 'Basic dashboards', 'Alerts and reports'],
              },
              {
                name: 'Professional',
                price: '$79',
                desc: 'For growing companies that need deeper analytics.',
                features: ['Advanced analytics', 'Multi-user access', 'Order management'],
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                desc: 'For multi-location businesses with complex workflows.',
                features: ['Admin controls', 'Priority support', 'Custom onboarding'],
              },
            ].map((plan) => (
              <div key={plan.name} className="rounded-2xl border border-border bg-card p-8">
                <p className="text-sm uppercase tracking-wide text-primary">{plan.name}</p>
                <h3 className="mt-4 text-4xl font-bold">{plan.price}</h3>
                <p className="mt-3 text-muted-foreground">{plan.desc}</p>
                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <p key={feature}>{feature}</p>
                  ))}
                </div>
                <Link
                  to="/register"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-accent"
                >
                  Choose Plan
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-4xl font-bold mb-5">Built for teams that need clarity fast</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Vantage is designed for admin and client teams that need a reliable view of inventory, orders, alerts, and performance without digging through disconnected tools.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              From day-to-day operations to strategic planning, the platform brings reporting, monitoring, and operational visibility into one place.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Operational coverage', value: 'Inventory & orders tracking' },
              { label: 'Insights', value: 'Analytics and forecasting ready' },
              { label: 'Alerts', value: 'Smart notifications' },
              { label: 'Support', value: 'Email and guided onboarding' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to upgrade your decisions?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of companies making better decisions with Vantage.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-accent transition-all glow"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
