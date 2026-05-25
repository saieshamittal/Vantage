import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('vantage_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('vantage_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Admin email = admin role, all others = client role
    const isAdmin = email.toLowerCase() === 'admin@vantage.com'
    const role = isAdmin ? 'admin' : 'client'
    
    const newUser = {
      id: isAdmin ? '1' : Date.now().toString(),
      name: isAdmin ? 'Alex Chen' : email.split('@')[0],
      email: email.toLowerCase(),
      role: role,
      avatar: isAdmin ? 'AC' : email.charAt(0).toUpperCase(),
      company: isAdmin ? 'Vantage Inc.' : 'Client Company'
    }
    
    setUser(newUser)
    localStorage.setItem('vantage_user', JSON.stringify(newUser))
    return true
  }

  const register = async (name, email, password) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Registration always creates a client user
    const newUser = {
      id: Date.now().toString(),
      name: name,
      email: email.toLowerCase(),
      role: 'client',
      avatar: name.charAt(0).toUpperCase(),
      company: 'New Company'
    }
    
    setUser(newUser)
    localStorage.setItem('vantage_user', JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('vantage_user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
