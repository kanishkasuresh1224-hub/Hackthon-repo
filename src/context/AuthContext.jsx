import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export const demoUsers = {
  student: { id: 'student', name: 'Ananya Raman', email: 'ananya@campus.demo', role: 'student', registerNumber: '22CS104', department: 'Computer Science', yearSection: 'III Year · A' },
  staff: { id: 'staff', name: 'Dr. Meera Nair', email: 'meera@campus.demo', role: 'staff', department: 'Computer Science' },
  hod: { id: 'hod', name: 'Dr. Arjun Menon', email: 'arjun@campus.demo', role: 'hod', department: 'Computer Science' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const value = useMemo(() => ({
    user,
    login: (role) => setUser(demoUsers[role] ?? null),
    logout: () => setUser(null),
  }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
