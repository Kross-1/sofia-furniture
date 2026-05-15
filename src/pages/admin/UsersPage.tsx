import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserPlus,
  Pencil,
  Trash2,
  Shield,
  ShieldCheck,
  X,
  Save,
  AlertCircle,
} from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser, isDeveloper, users, addUser, updateUser, deleteUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof users[0] | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin' as 'developer' | 'admin',
  });
  const [error, setError] = useState('');

  if (!isDeveloper) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <h2 className="text-xl font-semibold mb-2">Доступ запрещен</h2>
        <p className="text-muted-foreground">
          Управление пользователями доступно только разработчику.
        </p>
      </div>
    );
  }

  const handleOpenModal = (user?: typeof users[0]) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        role: 'admin',
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setError('');
  };

  const handleSave = async () => {
    if (!formData.email) {
      setError('Заполните имя пользователя');
      return;
    }

    // Check for duplicate email
    const duplicateEmail = users.find(
      u => u.email === formData.email && u.id !== editingUser?.id
    );
    if (duplicateEmail) {
      setError('Пользователь с таким именем уже существует');
      return;
    }

    if (editingUser) {
      // Update existing user
      const updates: { email?: string; password?: string; role?: 'developer' | 'admin' } = {
        email: formData.email,
        role: formData.role,
      };
      if (formData.password) {
        updates.password = formData.password;
      }
      await updateUser(editingUser.id, updates);
    } else {
      // Create new user
      if (!formData.password) {
        setError('Введите пароль');
        return;
      }
      if (formData.password.length < 4) {
        setError('Пароль должен быть не менее 4 символов');
        return;
      }
      await addUser({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
    }

    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      setError('Нельзя удалить самого себя');
      return;
    }

    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      await deleteUser(id);
    }
  };

  const handleRoleChange = async (id: string, newRole: 'developer' | 'admin') => {
    if (id === currentUser?.id && newRole !== 'developer') {
      setError('Нельзя изменить свою роль');
      return;
    }
    await updateUser(id, { role: newRole });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Управление пользователями
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Только разработчик может управлять пользователями
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-accent inline-flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Добавить пользователя
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-muted-foreground">
                  Имя
                </th>
                <th className="text-left px-6 py-4 font-medium text-muted-foreground">
                  Роль
                </th>
                <th className="text-left px-6 py-4 font-medium text-muted-foreground">
                  Дата создания
                </th>
                <th className="text-right px-6 py-4 font-medium text-muted-foreground">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.role === 'developer'
                            ? 'bg-violet-500/15'
                            : 'bg-sky-500/15'
                        }`}
                      >
                        {user.role === 'developer' ? (
                          <ShieldCheck className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        ) : (
                          <Shield className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.email}</p>
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-muted-foreground">
                            (Вы)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value as 'developer' | 'admin'
                        )
                      }
                      disabled={user.id === currentUser?.id}
                      className={`px-3 py-1 rounded-full text-sm border-0 cursor-pointer ${
                        user.role === 'developer'
                          ? 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30'
                          : 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                      } disabled:opacity-50`}
                    >
                      <option value="developer">Разработчик</option>
                      <option value="admin">Админ</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {user.created_at}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={user.id === currentUser?.id}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-md">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold">
                {editingUser ? 'Редактировать' : 'Добавить пользователя'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Email / Login */}
              <div>
                <label className="block text-sm font-medium mb-2">Имя пользователя *</label>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input-field"
                  placeholder="Введите имя"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {editingUser ? 'Новый пароль (оставьте пустым)' : 'Пароль *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-2">Роль *</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as 'developer' | 'admin',
                    })
                  }
                  className="input-field"
                >
                  <option value="admin">Админ</option>
                  <option value="developer">Разработчик</option>
                </select>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                className="btn-accent inline-flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
