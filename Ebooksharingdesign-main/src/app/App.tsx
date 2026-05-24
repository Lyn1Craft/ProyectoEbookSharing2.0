import { Search, BookOpen, Bell, User, ChevronDown, X, Calendar, ExternalLink, Download, Loader2, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  type: 'digital' | 'physical';
  status: 'available' | 'requested' | 'online' | 'borrowed';
  loanDays?: number;
  returnDate?: string;
  loanDate?: string;
}

type FilterTab = 'all' | 'digital' | 'physical' | 'loans';

interface LoanModal { book: Book }
interface ReadModal { book: Book; results: OLResult[]; loading: boolean }

interface OLResult {
  key: string;
  title: string;
  author_name?: string[];
  ia?: string[];
  cover_i?: number;
}

const INITIAL_BOOKS: Book[] = [
  {
    id: 1,
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
    type: 'digital',
    status: 'online'
  },
  {
    id: 2,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    cover: 'https://images.unsplash.com/photo-1471970471555-19d4b113e9ed?w=400',
    type: 'physical',
    status: 'available',
    loanDays: 7
  },
  {
    id: 3,
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    cover: 'https://images.unsplash.com/photo-1632479734663-a742f1c4ef88?w=400',
    type: 'digital',
    status: 'online'
  },
  {
    id: 4,
    title: 'Design Patterns',
    author: 'Erich Gamma',
    cover: 'https://images.unsplash.com/photo-1716892001657-722e6e14ae29?w=400',
    type: 'physical',
    status: 'borrowed',
    returnDate: '24 de Mayo',
    loanDate: '10 de Mayo'
  },
  {
    id: 5,
    title: "You Don't Know JS",
    author: 'Kyle Simpson',
    cover: 'https://images.unsplash.com/photo-1647529735054-9b68c881fdc9?w=400',
    type: 'digital',
    status: 'online'
  },
  {
    id: 6,
    title: 'Eloquent JavaScript',
    author: 'Marijn Haverbeke',
    cover: 'https://images.unsplash.com/photo-1773206210829-ff35872d84cb?w=400',
    type: 'physical',
    status: 'available',
    loanDays: 14
  },
  {
    id: 7,
    title: 'Head First Design Patterns',
    author: 'Eric Freeman',
    cover: 'https://images.unsplash.com/photo-1763771234596-8f5b07a2ca8b?w=400',
    type: 'digital',
    status: 'online'
  },
  {
    id: 8,
    title: 'Refactoring',
    author: 'Martin Fowler',
    cover: 'https://images.unsplash.com/photo-1778169964312-fefff846cde8?w=400',
    type: 'physical',
    status: 'available',
    loanDays: 7
  }
];

function formatReturnDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState('recent');
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [loanModal, setLoanModal] = useState<LoanModal | null>(null);
  const [readModal, setReadModal] = useState<ReadModal | null>(null);
  const [loadingBookId, setLoadingBookId] = useState<number | null>(null);

  const filteredBooks = books.filter(book => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'digital') return matchesSearch && book.type === 'digital';
    if (activeTab === 'physical') return matchesSearch && book.type === 'physical';
    if (activeTab === 'loans') return matchesSearch && book.status === 'borrowed';
    return matchesSearch;
  });

  const borrowedCount = books.filter(b => b.status === 'borrowed').length;

  function confirmLoan() {
    if (!loanModal) return;
    const { book } = loanModal;
    const days = book.loanDays ?? 14;
    const returnDate = formatReturnDate(days);
    const loanDate = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

    setBooks(prev =>
      prev.map(b => b.id === book.id ? { ...b, status: 'borrowed', returnDate, loanDate } : b)
    );
    setLoanModal(null);
    toast.success('Préstamo confirmado', {
      description: `"${book.title}" debe devolverse el ${returnDate}.`,
      icon: <CheckCircle className="size-4 text-green-600" />,
      duration: 4000,
    });
  }

  async function handleReadOnline(book: Book) {
    setLoadingBookId(book.id);
    setReadModal({ book, results: [], loading: true });
    try {
      const q = encodeURIComponent(`${book.title} ${book.author}`);
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${q}&limit=5&fields=key,title,author_name,ia,cover_i`
      );
      const data = await res.json();
      setReadModal({ book, results: data.docs ?? [], loading: false });
    } catch {
      setReadModal({ book, results: [], loading: false });
      toast.error('No se pudo conectar con Open Library. Intenta más tarde.');
    } finally {
      setLoadingBookId(null);
    }
  }

  function openBook(result: OLResult) {
    if (result.ia?.length) {
      window.open(`https://archive.org/details/${result.ia[0]}`, '_blank');
    } else {
      window.open(`https://openlibrary.org${result.key}`, '_blank');
    }
    setReadModal(null);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="bg-white" style={{ borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="size-7" style={{ color: '#0284C7' }} />
            <h1 className="text-2xl" style={{ color: '#111827', fontFamily: 'Georgia, serif' }}>eBook Sharing</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-full hover:bg-gray-50 transition-colors">
              <Bell className="size-5" style={{ color: '#6B7280' }} />
              {borrowedCount > 0 && (
                <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full" style={{ backgroundColor: '#EF4444' }} />
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0284C7', border: '3px solid #DBEAFE' }}>
                <User className="size-5 text-white" />
              </div>
              <span className="text-sm font-medium" style={{ color: '#111827' }}>Evelin V.</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white" style={{ borderBottom: '2px solid #F3F4F6' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-1">
            {([
              { key: 'all', label: 'Todos los libros', color: '#0284C7', bg: '#F0F9FF' },
              { key: 'digital', label: 'Recursos Digitales', color: '#16A34A', bg: '#F0FDF4' },
              { key: 'physical', label: 'Libros Físicos', color: '#0284C7', bg: '#F0F9FF' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-6 py-4 text-sm transition-all relative rounded-t-2xl"
                style={{
                  backgroundColor: activeTab === tab.key ? tab.bg : 'transparent',
                  color: activeTab === tab.key ? tab.color : '#6B7280',
                }}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: tab.color }} />
                )}
              </button>
            ))}
            <button
              onClick={() => setActiveTab('loans')}
              className="px-6 py-4 text-sm transition-all relative rounded-t-2xl flex items-center gap-2"
              style={{
                backgroundColor: activeTab === 'loans' ? '#F0F9FF' : 'transparent',
                color: activeTab === 'loans' ? '#0284C7' : '#6B7280',
              }}
            >
              Mis Préstamos
              {borrowedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{
                  backgroundColor: activeTab === 'loans' ? '#0284C7' : '#E5E7EB',
                  color: activeTab === 'loans' ? '#FFFFFF' : '#6B7280',
                }}>
                  {borrowedCount}
                </span>
              )}
              {activeTab === 'loans' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#0284C7' }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-8 py-8">

        {/* Search & Sort */}
        <div className="mb-8 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5" style={{ color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Buscar libros, autores..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border outline-none transition-all text-sm"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#111827', borderRadius: '16px' }}
              onFocus={e => (e.target.style.borderColor = '#0284C7')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-12 py-3.5 border outline-none cursor-pointer text-sm"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#111827', minWidth: '180px', borderRadius: '16px' }}
            >
              <option value="recent">Más recientes</option>
              <option value="title">Por título</option>
              <option value="author">Por autor</option>
              <option value="popular">Más populares</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-5 pointer-events-none" style={{ color: '#6B7280' }} />
          </div>
        </div>

        {/* Loans banner */}
        {activeTab === 'loans' && borrowedCount > 0 && (
          <div className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Calendar className="size-5 shrink-0" style={{ color: '#0284C7' }} />
            <p className="text-sm" style={{ color: '#1D4ED8' }}>
              Tienes <strong>{borrowedCount}</strong> libro{borrowedCount !== 1 ? 's' : ''} prestado{borrowedCount !== 1 ? 's' : ''}. Recuerda devolverlos a tiempo.
            </p>
          </div>
        )}

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              loadingBookId={loadingBookId}
              onRequestLoan={() => setLoanModal({ book })}
              onReadOnline={() => handleReadOnline(book)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl">
            <BookOpen className="size-14 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
            <h3 className="mb-2 text-lg" style={{ color: '#6B7280' }}>
              {activeTab === 'loans' ? 'No tienes libros prestados' : 'No se encontraron libros'}
            </h3>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>
              {activeTab === 'loans'
                ? 'Explora la colección y solicita tu primer préstamo'
                : 'Intenta ajustar tu búsqueda'}
            </p>
          </div>
        )}
      </main>

      {/* Loan Confirmation Modal */}
      {loanModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setLoanModal(null)}
        >
          <div
            className="bg-white w-full max-w-md p-6"
            style={{ borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="size-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                <BookOpen className="size-6" style={{ color: '#0284C7' }} />
              </div>
              <button onClick={() => setLoanModal(null)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="size-4" style={{ color: '#6B7280' }} />
              </button>
            </div>
            <h2 className="text-xl mb-1" style={{ color: '#111827' }}>Confirmar Préstamo</h2>
            <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Estás a punto de solicitar el préstamo de:</p>
            <div className="flex gap-4 mb-5 p-4 rounded-2xl" style={{ backgroundColor: '#F9FAFB' }}>
              <img src={loanModal.book.cover} alt={loanModal.book.title} className="w-16 h-20 object-cover rounded-xl" />
              <div>
                <p className="font-medium text-sm mb-1" style={{ color: '#111827' }}>{loanModal.book.title}</p>
                <p className="text-xs mb-3" style={{ color: '#6B7280' }}>{loanModal.book.author}</p>
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5" style={{ color: '#0284C7' }} />
                  <span className="text-xs" style={{ color: '#0284C7' }}>Duración: {loanModal.book.loanDays ?? 14} días</span>
                </div>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  Devolución: {formatReturnDate(loanModal.book.loanDays ?? 14)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setLoanModal(null)}
                className="flex-1 py-3 rounded-2xl text-sm"
                style={{ backgroundColor: '#F3F4F6', color: '#374151' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmLoan}
                className="flex-1 py-3 rounded-2xl text-sm text-white"
                style={{ backgroundColor: '#0284C7', boxShadow: '0 4px 12px rgba(2,132,199,0.3)' }}
              >
                Confirmar Préstamo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read Online Modal */}
      {readModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setReadModal(null)}
        >
          <div
            className="bg-white w-full max-w-lg p-6"
            style={{ borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="size-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
                <BookOpen className="size-6" style={{ color: '#16A34A' }} />
              </div>
              <button onClick={() => setReadModal(null)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="size-4" style={{ color: '#6B7280' }} />
              </button>
            </div>
            <h2 className="text-xl mb-1" style={{ color: '#111827' }}>Leer en Línea</h2>
            <p className="text-sm mb-5" style={{ color: '#6B7280' }}>"{readModal.book.title}" — {readModal.book.author}</p>

            {readModal.loading ? (
              <div className="py-10 flex flex-col items-center gap-3">
                <Loader2 className="size-8 animate-spin" style={{ color: '#0284C7' }} />
                <p className="text-sm" style={{ color: '#6B7280' }}>Buscando en Open Library...</p>
              </div>
            ) : readModal.results.length > 0 ? (
              <div className="space-y-3 mb-4">
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Resultados encontrados</p>
                {readModal.results.slice(0, 3).map(result => (
                  <button
                    key={result.key}
                    onClick={() => openBook(result)}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:shadow-md"
                    style={{ border: '1px solid #E5E7EB', backgroundColor: '#FAFAFA' }}
                  >
                    {result.cover_i ? (
                      <img src={`https://covers.openlibrary.org/b/id/${result.cover_i}-S.jpg`} alt={result.title} className="w-10 h-14 object-cover rounded-lg" />
                    ) : (
                      <div className="w-10 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
                        <BookOpen className="size-4" style={{ color: '#9CA3AF' }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1" style={{ color: '#111827' }}>{result.title}</p>
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#6B7280' }}>{result.author_name?.join(', ') ?? 'Autor desconocido'}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {result.ia?.length ? (
                          <>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>Disponible</span>
                            <Download className="size-3" style={{ color: '#16A34A' }} />
                          </>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>Ver en Open Library</span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="size-4 shrink-0" style={{ color: '#9CA3AF' }} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center mb-4">
                <p className="text-sm mb-1" style={{ color: '#374151' }}>No se encontraron coincidencias directas.</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Prueba la búsqueda general en Open Library.</p>
              </div>
            )}

            <button
              onClick={() => {
                window.open(`https://openlibrary.org/search?q=${encodeURIComponent(readModal.book.title + ' ' + readModal.book.author)}`, '_blank');
                setReadModal(null);
              }}
              className="w-full py-3 rounded-2xl text-sm flex items-center justify-center gap-2"
              style={{ border: '1px solid #E5E7EB', color: '#0284C7', backgroundColor: '#F0F9FF' }}
            >
              <ExternalLink className="size-4" />
              Buscar en Open Library
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface BookCardProps {
  book: Book;
  loadingBookId: number | null;
  onRequestLoan: () => void;
  onReadOnline: () => void;
}

function BookCard({ book, loadingBookId, onRequestLoan, onReadOnline }: BookCardProps) {
  const isLoadingThis = loadingBookId === book.id;

  return (
    <div
      className="bg-white overflow-hidden transition-all hover:shadow-lg"
      style={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
    >
      <div className="aspect-[3/4] overflow-hidden relative" style={{ backgroundColor: '#F9FAFB' }}>
        <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
        {book.type === 'digital' && (
          <div className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: 'rgba(22,163,74,0.9)', color: '#FFFFFF', borderRadius: '8px' }}>
            Digital
          </div>
        )}
        {book.status === 'borrowed' && (
          <div className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', borderRadius: '8px' }}>
            Prestado
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium mb-1 line-clamp-2 leading-snug" style={{ color: '#111827' }}>{book.title}</h3>
        <p className="text-xs mb-3" style={{ color: '#6B7280' }}>{book.author}</p>

        {book.status === 'borrowed' && book.returnDate && (
          <div className="mb-3 flex items-center gap-1.5 text-xs" style={{ color: '#6B7280' }}>
            <Calendar className="size-3.5 shrink-0" style={{ color: '#0284C7' }} />
            <span>Devolver: <strong style={{ color: '#111827' }}>{book.returnDate}</strong></span>
          </div>
        )}

        {book.type === 'digital' && (
          <button
            onClick={onReadOnline}
            disabled={isLoadingThis}
            className="w-full py-2.5 text-sm text-white transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: '#16A34A', borderRadius: '12px', boxShadow: '0 2px 8px rgba(22,163,74,0.25)', opacity: isLoadingThis ? 0.8 : 1 }}
          >
            {isLoadingThis
              ? <><Loader2 className="size-4 animate-spin" /> Buscando...</>
              : <><ExternalLink className="size-4" /> Leer en Línea</>}
          </button>
        )}

        {book.type === 'physical' && book.status === 'available' && (
          <button
            onClick={onRequestLoan}
            className="w-full py-2.5 text-sm text-white transition-all"
            style={{ backgroundColor: '#0284C7', borderRadius: '12px', boxShadow: '0 2px 8px rgba(2,132,199,0.25)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Solicitar Préstamo
          </button>
        )}

        {book.type === 'physical' && book.status === 'borrowed' && (
          <div
            className="w-full py-2.5 text-sm text-center"
            style={{ backgroundColor: '#F3F4F6', color: '#6B7280', borderRadius: '12px' }}
          >
            En préstamo
          </div>
        )}
      </div>
    </div>
  );
}
