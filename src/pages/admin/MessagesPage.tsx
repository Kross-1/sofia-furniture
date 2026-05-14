import { useState, useEffect } from 'react';
import { MessageSquare, Phone, User, Calendar, Trash2, CheckCircle, Eye, Filter, Package } from 'lucide-react';
import { getMessages, updateMessageStatus, deleteMessage as deleteMessageAPI } from '../../lib/db';

interface Message {
  id: string;
  name: string;
  phone: string;
  comment: string;
  date: string;
  status: 'new' | 'read' | 'responded';
  productId?: number;
  productName?: string;
  productPrice?: number;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'responded'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMessages();
        setMessages(data.map((msg: any) => ({
          id: msg.id,
          name: msg.name,
          phone: msg.phone,
          comment: msg.comment || '',
          date: msg.createdAt || msg.date || new Date().toISOString(),
          status: msg.status || 'new',
          productId: msg.productId,
          productName: msg.productName || msg.product,
          productPrice: msg.productPrice,
        })));
      } catch {
        const saved = localStorage.getItem('sofia_messages');
        if (saved) {
          setMessages(JSON.parse(saved));
        }
      }
    };
    load();
  }, []);

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    return msg.status === filter;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const markAsRead = (id: string) => {
    updateMessageStatus(id, 'read').catch(() => {});
    setMessages(prev => {
      const updated = prev.map(msg =>
        msg.id === id ? { ...msg, status: 'read' as const } : msg
      );
      localStorage.setItem('sofia_messages', JSON.stringify(updated));
      return updated;
    });
  };

  const markAsResponded = (id: string) => {
    updateMessageStatus(id, 'responded').catch(() => {});
    setMessages(prev => {
      const updated = prev.map(msg =>
        msg.id === id ? { ...msg, status: 'responded' as const } : msg
      );
      localStorage.setItem('sofia_messages', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteMessage = (id: string) => {
    if (confirm('Удалить это сообщение?')) {
      deleteMessageAPI(id).catch(() => {});
      setMessages(prev => {
        const updated = prev.filter(msg => msg.id !== id);
        localStorage.setItem('sofia_messages', JSON.stringify(updated));
        return updated;
      });
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  const newCount = messages.filter(m => m.status === 'new').length;
  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    responded: messages.filter(m => m.status === 'responded').length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Сообщения от клиентов</h1>
        <p className="text-muted-foreground mt-1">Заявки с формы обратной связи</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-4 rounded-xl border shadow-sm">
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Всего</div>
        </div>
        <div className="bg-card p-4 rounded-xl border shadow-sm">
          <div className="text-2xl font-bold text-destructive">{stats.new}</div>
          <div className="text-sm text-muted-foreground">Новые</div>
        </div>
        <div className="bg-card p-4 rounded-xl border shadow-sm">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.read}</div>
          <div className="text-sm text-muted-foreground">Просмотрены</div>
        </div>
        <div className="bg-card p-4 rounded-xl border shadow-sm">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.responded}</div>
          <div className="text-sm text-muted-foreground">Обработаны</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-accent text-white' : 'bg-card text-foreground border hover:bg-muted'
          }`}
        >
          Все ({stats.total})
        </button>
        <button
          onClick={() => setFilter('new')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'new' ? 'bg-red-600 text-white' : 'bg-card text-foreground border hover:bg-muted'
          }`}
        >
          Новые ({stats.new})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'read' ? 'bg-amber-600 text-white' : 'bg-card text-foreground border hover:bg-muted'
          }`}
        >
          Просмотрены ({stats.read})
        </button>
        <button
          onClick={() => setFilter('responded')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'responded' ? 'bg-emerald-600 text-white' : 'bg-card text-foreground border hover:bg-muted'
          }`}
        >
          Обработаны ({stats.responded})
        </button>
      </div>

      {/* Messages List */}
      <div className="bg-card text-card-foreground border border-border rounded-xl border shadow-sm overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filter === 'all'
                ? 'Пока нет сообщений'
                : `Нет ${filter === 'new' ? 'новых' : filter === 'read' ? 'просмотренных' : 'обработанных'} сообщений`}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredMessages.map(msg => (
              <div
                key={msg.id}
                className={`p-4 hover:bg-muted transition-colors cursor-pointer ${
                  msg.status === 'new' ? 'bg-destructive/5' : ''
                }`}
                onClick={() => {
                  setSelectedMessage(msg);
                  if (msg.status === 'new') {
                    markAsRead(msg.id);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {msg.status === 'new' && (
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      )}
                      <span className="font-semibold text-foreground">{msg.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        msg.status === 'new' ? 'bg-destructive/15 text-destructive border border-destructive/30' :
                        msg.status === 'read' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 dark:text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {msg.status === 'new' ? 'Новое' : msg.status === 'read' ? 'Просмотрено' : 'Обработано'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {msg.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(msg.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {msg.productName && (
                      <div className="flex items-center gap-2 text-sm text-accent font-medium mb-1">
                        <Package className="w-4 h-4" />
                        {msg.productName}
                        {msg.productPrice && (
                          <span className="text-muted-foreground font-normal">
                            — {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(msg.productPrice)}
                          </span>
                        )}
                      </div>
                    )}
                    {msg.comment && (
                      <p className="text-muted-foreground line-clamp-2">{msg.comment}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {msg.status !== 'responded' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsResponded(msg.id);
                        }}
                        className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Отметить как обработанное"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(msg.id);
                      }}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground border border-border rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Детали сообщения</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-muted-foreground/70 hover:text-muted-foreground"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{selectedMessage.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedMessage.phone}</div>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Дата</div>
                <div className="text-sm text-foreground">
                  {new Date(selectedMessage.date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {selectedMessage.productName && (
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">Заказанный товар</div>
                  <div className="bg-accent/10 border border-accent/20 p-3 rounded-lg">
                    <div className="font-semibold text-foreground">{selectedMessage.productName}</div>
                    {selectedMessage.productPrice && (
                      <div className="text-accent font-bold mt-1">
                        {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(selectedMessage.productPrice)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedMessage.comment && (
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">Комментарий</div>
                  <div className="bg-muted p-3 rounded-lg text-foreground whitespace-pre-wrap">
                    {selectedMessage.comment}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex justify-between">
              <button
                onClick={() => {
                  deleteMessage(selectedMessage.id);
                  setSelectedMessage(null);
                }}
                className="flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Удалить
              </button>
              {selectedMessage.status !== 'responded' && (
                <button
                  onClick={() => {
                    markAsResponded(selectedMessage.id);
                    setSelectedMessage({ ...selectedMessage, status: 'responded' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Отметить обработанным
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
