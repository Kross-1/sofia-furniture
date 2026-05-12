import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  email: string;
  password: string;
  role: 'developer' | 'admin';
  created_at: string;
}

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (loginInput: string, password: string) => Promise<boolean>;
  logout: () => void;
  isDeveloper: boolean;
  users: AdminUser[];
  addUser: (user: Omit<AdminUser, 'id' | 'created_at'>) => void;
  updateUser: (id: string, updates: Partial<AdminUser>) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'sofia_admin_users';
const SESSION_KEY = 'sofia_admin_session';

// Default users
const defaultUsers: AdminUser[] = [
  {
    id: '1',
    email: 'Kross',
    password: 'Maga28102004',
    role: 'developer',
    created_at: '2024-01-01'
  },
  {
    id: '2',
    email: 'admin@sofia.ru',
    password: 'admin123',
    role: 'admin',
    created_at: '2024-01-15'
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>(() => {
    // Load users from localStorage or use defaults
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    // Save defaults to localStorage on first load
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  });

  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    // Check for stored session
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        // Verify user still exists
        const foundUser = users.find(u => u.id === session.id);
        if (foundUser) {
          setUser(foundUser);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, [users]);

  const login = async (loginInput: string, password: string): Promise<boolean> => {
    // Check against stored users (match by email/login field)
    const foundUser = users.find(
      (u) => (u.email === loginInput || u.email.toLowerCase() === loginInput.toLowerCase()) && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role
      }));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const addUser = (newUserData: Omit<AdminUser, 'id' | 'created_at'>) => {
    const newUser: AdminUser = {
      ...newUserData,
      id: String(Date.now()),
      created_at: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<AdminUser>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, ...updates };
        // Update current user session if editing self
        if (user?.id === id && updates.password) {
          setUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isDeveloper: user?.role === 'developer',
        users,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
