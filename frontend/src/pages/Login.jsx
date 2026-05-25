import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage, loginUser } from "../services/api";
import { toast } from 'sonner'
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react'
import BrandLogo from '../components/layout/BrandLogo'
import SiteFooter from '../components/layout/SiteFooter'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
  
    setIsLoading(true);
    setError("");
  
    try {
      const response = await loginUser({ email, password });
  
      // store token + user
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
  
      toast.success("Welcome back!");
  
      // role-based navigation
      if (
        response.data.user.role === "admin" ||
        email === "admin@vantage.com"
      ) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, "Login failed");
      setError(msg);
      toast.error(msg);
    }
  
    setIsLoading(false);
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
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
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
                  autoComplete="off"
                  className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
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
                  placeholder="Enter your password"
                  autoComplete="new-password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-primary" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary hover:text-accent transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          {error && (
            <p className="text-destructive text-sm mt-2">{error}</p>
        )}

          <p className="mt-8 text-center text-muted-foreground">
            {"Don't have an account? "}
            <Link to="/register" className="text-primary hover:text-accent transition-colors font-medium">
              Sign up
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-4 rounded-xl bg-card border border-border">
            <p className="text-sm font-medium mb-3">Demo Credentials:</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="text-foreground">Admin:</span> admin@vantage.com / admin123</p>
              <p><span className="text-foreground">Client:</span> use your registered email and password</p>
            </div>
          </div>
          </div>
        </div>

        {/* Right Panel - Visual */}
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-12">
          <div className="max-w-lg text-center">
            <div className="w-32 h-32 mx-auto mb-8 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse-glow">
              <img src="/logo.png" alt="Vantage" className="h-20 w-auto" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Decisions, Upgraded</h2>
            <p className="text-muted-foreground leading-relaxed">
              Transform your data into strategic insights with our AI-powered analytics platform. 
              Make decisions with confidence.
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
