import { useState } from 'react';
import { AuthGate } from './components/AuthGate';
import { BookList } from './components/BookList';
import { AddBookModal } from './components/AddBookModal';
import { TabBar } from './components/ui/TabBar';
import { useBooks } from './hooks/useBooks';

function App() {
  const { books, loading, error, addBook, deleteBook, updateBook } = useBooks();
  const [activeTab, setActiveTab] = useState<'library' | 'scan' | 'settings'>('library');

  // Modal control
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleTabChange = (tab: 'library' | 'scan' | 'settings') => {
    if (tab === 'scan') {
      setIsAddModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <AuthGate>
      <div className="min-h-screen bg-background text-text-primary selection:bg-system-blue/20">

        <main className="mx-auto max-w-7xl relative pb-24"> {/* pb-24 for TabBar */}
          {loading ? (
            <div className="flex h-screen items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-system-gray3 border-t-system-blue"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-system-red">{error}</div>
          ) : (
            <>
              {activeTab === 'library' && (
                <BookList
                  books={books}
                  filterTag={null}
                  onDelete={deleteBook}
                  onUpdate={updateBook}
                />
              )}

              {activeTab === 'settings' && (
                <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
                  <h2 className="text-xl font-bold mb-4">設定</h2>
                  <button
                    onClick={() => {
                      localStorage.removeItem('flash_shelf_auth');
                      window.location.reload();
                    }}
                    className="px-6 py-2 rounded-full bg-system-gray6 text-system-red font-medium hover:bg-system-gray5"
                  >
                    ロックする（ログアウト）
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <AddBookModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            // Revert tab to library if needed, or keep simpler
          }}
          onAdd={async (book) => {
            await addBook(book);
            return true;
          }}
        />
      </div>
    </AuthGate>
  );
}

export default App;
