import { Outlet, Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const APP_NAME = 'Three Tasks Dashboard';

export default function Layout() {
  const location = useLocation();

  const navLinkClass = (path: string) =>
    clsx(
      'rounded-lg px-3 py-2 text-sm font-medium transition',
      location.pathname === path
        ? 'bg-indigo-600 text-white'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-white">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-600" />
            <div>
              <div className="text-base font-bold text-gray-900">{APP_NAME}</div>
              <div className="text-xs text-gray-500">HotPocket task tracker</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/" className={navLinkClass('/')}>
              Tasks
            </Link>
            <Link to="/cluster" className={navLinkClass('/cluster')}>
              Cluster
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-100 py-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  );
}
