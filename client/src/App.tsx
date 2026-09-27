import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { useUIStore } from './store/uiStore';
import { useAuthStore } from './store/authStore';
import { tokenStorage } from './lib/axios';
import api from './lib/axios';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const { setUser, logout } = useAuthStore();
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // On mount: if a token exists in storage, verify it with the backend and restore the session.
  useEffect(() => {
    const restoreSession = async () => {
      const source = tokenStorage.getSource();
      const token = tokenStorage.get();

      if (!token || !source) {
        setIsRestoring(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        const user = res.data.user;

        // Security / Edge Case Check:
        // ADMIN or HR sessions must not persist in localStorage across tab/browser restarts.
        if (source === 'localStorage' && (user.role === 'ADMIN' || user.role === 'HR')) {
          logout();
        } else {
          setUser(user, token);
        }
      } catch {
        // Token is invalid or expired — clear it
        logout();
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, [setUser, logout]);

  if (isRestoring) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
