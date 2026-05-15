import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUsers, addUserDB, updateUserDB, deleteUserDB, checkAuth } from '../lib/db';

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
  addUser: (user: Omit<AdminUser, 'id' | 'created_at'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<AdminUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'sofia_admin_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load users from DB on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const dbUsers = await getUsers();
        const mapped: AdminUser[] = dbUsers.map((u: any) => ({
          id: u.id,
          email: u.login,
          password: u.password,
          role: u.role as 'developer' | 'admin',
          created_at: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
        }));
        setUsers(mapped);

        // Check for stored session
        const storedSession = localStorage.getItem(SESSION_KEY);
        if (storedSession) {
          try {
            const session = JSON.parse(storedSession);
            const foundUser = mapped.find(u => u.id === session.id);
            if (foundUser) {
              setUser(foundUser);
            } else {
              localStorage.removeItem(SESSION_KEY);
            }
          } catch {
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (e) {
        console.error('Error loading users:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  const login = async (loginInput: string, password: string): Promise<boolean> => {
    try {
      const result = await checkAuth(loginInput, password);
      if (result && result.length > 0) {
        const foundUser: AdminUser = {
          id: result[0].id,
          email: result[0].login,
          password: result[0].password,
          role: result[0].role as 'developer' | 'admin',
          created_at: result[0].createdAt ? new Date(result[0].createdAt).toISOString().split('T')[0] : '',
        };
        setUser(foundUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify({
          id: foundUser.id,
          email: foundUser.email,
          role: foundUser.role
        }));
        return true;
      }
    } catch (e) {
      console.error('Login error:', e);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const addUser = async (newUserData: Omit<AdminUser, 'id' | 'created_at'>) => {
    try {
      const result = await addUserDB(newUserData.email, newUserData.password, newUserData.role);
      const newUser: AdminUser = {
        id: result.id,
        email: result.login,
        password: result.password,
        role: result.role as 'developer' | 'admin',
        created_at: result.createdAt ? new Date(result.createdAt).toISOString().split('T')[0] : '',
      };
      setUsers(prev => [...prev, newUser]);
    } catch (e) {
      console.error('Error adding user:', e);
    }
  };

  const updateUser = async (id: string, updates: Partial<AdminUser>) => {
    try {
      const dbUpdates: { login?: string; password?: string; role?: string } = {};
      if (updates.email) dbUpdates.login = updates.email;
      if (updates.password) dbUpdates.password = updates.password;
      if (updates.role) dbUpdates.role = updates.role;

      const result = await updateUserDB(id, dbUpdates);
      setUsers(prev => prev.map(u => {
        if (u.id === id) {
          const updated = {
            ...u,
            ...(updates.email ? { email: updates.email } : {}),
            ...(updates.password ? { password: updates.password } : {}),
            ...(updates.role ? { role: updates.role } : {}),
          };
          if (user?.id === id) {
            setUser(updated);
            localStorage.setItem(SESSION_KEY, JSON.stringify({
              id: updated.id,
              email: updated.email,
              role: updated.role
            }));
          }
          return updated;
        }
        return u;
      }));
    } catch (e) {
      console.error('Error updating user:', e);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteUserDB(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      console.error('Error deleting user:', e);
    }
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
