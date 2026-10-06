import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppRoute = '/' | '/cart' | '/checkout' | '/order-success' | '/cashier';

interface RouterContextType {
  currentRoute: AppRoute;
  navigate: (route: string) => void;
  queryParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function normalizePath(pathname: string): AppRoute {
  // Clean trailing slashes except for root
  const clean = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  if (clean === '/cart') return '/cart';
  if (clean === '/checkout') return '/checkout';
  if (clean === '/order-success' || clean === '/orders') return '/order-success';
  if (clean.startsWith('/cashier')) return '/cashier';
  return '/';
}

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      return normalizePath(window.location.pathname);
    }
    return '/';
  });

  const [queryParams, setQueryParams] = useState<URLSearchParams>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(normalizePath(window.location.pathname));
      setQueryParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (typeof window === 'undefined') return;

    // Check if path has existing query params
    const [pathPart, queryPart] = path.split('?');
    const targetRoute = normalizePath(pathPart);

    // If query string is not provided in path and we have an existing 'table' parameter, preserve it for customer routes
    const newParams = new URLSearchParams(queryPart || '');
    if (!newParams.has('table') && queryParams.has('table') && targetRoute !== '/cashier') {
      newParams.set('table', queryParams.get('table')!);
    }

    const fullUrl = newParams.toString() ? `${targetRoute}?${newParams.toString()}` : targetRoute;

    window.history.pushState({}, '', fullUrl);
    setCurrentRoute(targetRoute);
    setQueryParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RouterContext.Provider value={{ currentRoute, navigate, queryParams }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

export const Link: React.FC<{
  to: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}> = ({ to, className, children, onClick }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};
