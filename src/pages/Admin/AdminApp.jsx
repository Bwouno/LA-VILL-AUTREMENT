import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import {
  adminLogout,
  adminMe
} from '../../lib/api.js';

import LoginPage from './pages/LoginPage.jsx';
import ArticlesPage from './pages/ArticlesPage.jsx';
import ArticleEditPage from './pages/ArticleEditPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

import styles from './AdminApp.module.css';

const AuthContext = createContext(null);

function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthContext');
  return value;
}

function AdminLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>Espace admin</div>
          <div className={styles.brandUser}>
            {user.username} <span className={styles.brandRole}>({user.role})</span>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Admin">
          <Link className={styles.navLink} to="/admin/articles">
            Articles
          </Link>
          {user.role === 'admin' && (
            <Link className={styles.navLink} to="/admin/users">
              Utilisateurs
            </Link>
          )}
          <a className={styles.navLink} href="/">
            Voir le site
          </a>
        </nav>

        <button className={styles.logout} type="button" onClick={logout}>
          Déconnexion
        </button>
      </aside>

      <div className={styles.content}>
        <header className={styles.topbar}>
          <div className={styles.topbarTitle}>Administration</div>
        </header>
        <div className={styles.page}>{children}</div>
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingCard}>Chargement…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return children;
}

function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/admin/articles" replace />;
  return children;
}

export default function AdminApp() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({ status: 'loading', user: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await adminMe();
        if (cancelled) return;
        setAuthState({ status: 'ready', user: result.user });
      } catch {
        if (cancelled) return;
        setAuthState({ status: 'ready', user: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      status: authState.status,
      user: authState.user,
      setUser: (user) => setAuthState({ status: 'ready', user }),
      logout: async () => {
        try {
          await adminLogout();
        } finally {
          setAuthState({ status: 'ready', user: null });
          navigate('/admin/login', { replace: true });
        }
      }
    }),
    [authState.status, authState.user, navigate]
  );

  return (
    <AuthContext.Provider value={value}>
      <Routes>
        <Route index element={<Navigate to="articles" replace />} />
        <Route path="login" element={<LoginPage onLoggedIn={value.setUser} />} />
        <Route
          path="articles"
          element={
            <RequireAuth>
              <AdminLayout>
                <ArticlesPage />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="articles/new"
          element={
            <RequireAuth>
              <AdminLayout>
                <ArticleEditPage mode="create" />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="articles/:id"
          element={
            <RequireAuth>
              <AdminLayout>
                <ArticleEditPage mode="edit" />
              </AdminLayout>
            </RequireAuth>
          }
        />
        <Route
          path="users"
          element={
            <RequireAuth>
              <RequireAdmin>
                <AdminLayout>
                  <UsersPage />
                </AdminLayout>
              </RequireAdmin>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="articles" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export { useAuth };
