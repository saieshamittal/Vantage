import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage, registerUser } from '../services/api'
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User } from 'lucide-react'
import BrandLogo from '../components/layout/BrandLogo'
import SiteFooter from '../components/layout/SiteFooter'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!name || !email || !password || !confirmPassword || !companyName) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }
  
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }
  
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy");
      toast.error("Please accept the Terms of Service and Privacy Policy");
      return;
    }
  
    setIsLoading(true);
    setError("");
  
    try {
      const response = await registerUser({
        name,
        email,
        password,
        company_name: companyName,
      });
  
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
  
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      const msg = getApiErrorMessage(err, "Registration failed");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1">
        {/* Left Panel - Form */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12 sm:px-16 lg:px-24">
          <div className="w-full max-w-md mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="mb-10">
            <div className="mb-8">
              <BrandLogo logoClassName="h-14 w-auto" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Create an account</h1>
            <p className="text-muted-foreground">Start your journey with Vantage</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Company Name
            </label>
            <input
            type="text"
    value={companyName}
    onChange={(e) => setCompanyName(e.target.value)}
    placeholder="Your company"
    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
  />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full pl-12 pr-12 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border bg-input text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{' '}
                <a href="#" className="text-primary hover:text-accent">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:text-accent">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
          {error && (
            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <p className="mt-8 text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-accent transition-colors font-medium">
              Sign in
            </Link>
          </p>
          </div>
        </div>

        {/* Right Panel - Visual */}
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-12">
          <div className="max-w-lg text-center">
            <div className="w-32 h-32 mx-auto mb-8 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse-glow">
              <img src="/logo.png" alt="Vantage" className="h-20 w-auto" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Join Vantage Today</h2>
            <p className="text-muted-foreground leading-relaxed">
              Start making data-driven decisions with our powerful analytics platform.
              Your first 14 days are free.
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
