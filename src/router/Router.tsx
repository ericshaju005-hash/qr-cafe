import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppRoute = '/' | '/cart' | '/checkout' | '/order-success' | '/cashier';

interface RouterContextType {
  currentRoute: AppRoute;
  navigate: (route: string) => void;
  queryParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Helper to determine if we are deployed on GitHub Pages or static host
function isGitHubPagesOrStatic(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname.endsWith('github.io') ||
    window.location.protocol === 'file:' ||
    window.location.hash.startsWith('#')
  );
}

// Extract the base repository prefix if running under a subpath (e.g. /CafeOrder)
function getRepoPrefix(): string {
  if (typeof window === 'undefined') return '';
  if (window.location.hostname.endsWith('github.io')) {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      return '/' + segments[0];
    }
  }
  return '';
}

// Clean and normalize any pathname or hash into known AppRoute
function parseCurrentRoute(): { route: AppRoute; params: URLSearchParams } {
  if (typeof window === 'undefined') {
    return { route: '/', params: new URLSearchParams() };
  }

  const hash = window.location.hash || '';
  const search = window.location.search || '';
  const pathname = window.location.pathname || '/';

  let rawPath = '/';
  const combinedParams = new URLSearchParams(search);

  // 1. Check if hash routing is active (#/cart or #/cashier?table=12)
  if (hash.startsWith('#')) {
    const cleanHash = hash.replace(/^#\/?/, '/');
    const [hRoute, hQuery] = cleanHash.split('?');
    rawPath = hRoute || '/';

    if (hQuery) {
      const hashParams = new URLSearchParams(hQuery);
      hashParams.forEach((val, key) => combinedParams.set(key, val));
    }
  } else {
    // 2. Otherwise extract from pathname, removing any repo prefix
    const repo = getRepoPrefix();
    let subPath = pathname;
    if (repo && subPath.startsWith(repo)) {
      subPath = subPath.slice(repo.length);
    }
    rawPath = subPath || '/';
  }

  // 3. Normalize to known routes
  const clean = rawPath.replace(/\/+$/, '') || '/';
  let route: AppRoute = '/';

  if (clean.endsWith('/cart') || clean === '/cart') {
    route = '/cart';
  } else if (clean.endsWith('/checkout') || clean === '/checkout') {
    route = '/checkout';
  } else if (clean.endsWith('/order-success') || clean.endsWith('/orders') || clean === '/order-success') {
    route = '/order-success';
  } else if (clean.includes('/cashier')) {
    route = '/cashier';
  }

  return { route, params: combinedParams };
}

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => parseCurrentRoute().route);
  const [queryParams, setQueryParams] = useState<URLSearchParams>(() => parseCurrentRoute().params);

  useEffect(() => {
    const handleLocationChange = () => {
      const parsed = parseCurrentRoute();
      setCurrentRoute(parsed.route);
      setQueryParams(parsed.params);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Initial check in case URL has hash or query params
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    if (typeof window === 'undefined') return;

    // Split target path and its potential query string
    const [pathPart, queryPart] = path.split('?');
    
    // Normalize target route
    let targetRoute: AppRoute = '/';
    const clean = pathPart.replace(/\/+$/, '') || '/';
    if (clean.endsWith('/cart') || clean === '/cart') targetRoute = '/cart';
    else if (clean.endsWith('/checkout') || clean === '/checkout') targetRoute = '/checkout';
    else if (clean.endsWith('/order-success') || clean.endsWith('/orders') || clean === '/order-success') targetRoute = '/order-success';
    else if (clean.includes('/cashier')) targetRoute = '/cashier';

    // Preserve table query param for customer routes if not specified
    const newParams = new URLSearchParams(queryPart || '');
    if (!newParams.has('table') && queryParams.has('table') && targetRoute !== '/cashier') {
      newParams.set('table', queryParams.get('table')!);
    }

    const queryStr = newParams.toString() ? `?${newParams.toString()}` : '';

    // If on GitHub Pages or already using hash, use Hash routing to guarantee zero 404s
    if (isGitHubPagesOrStatic()) {
      const repo = getRepoPrefix();
      const targetHash = `#${targetRoute}${queryStr}`;
      // Update hash in address bar
      window.location.hash = targetHash;
      setCurrentRoute(targetRoute);
      setQueryParams(newParams);
    } else {
      // Standard path-based routing for dev server and root domains
      const repo = getRepoPrefix();
      const fullUrl = `${repo}${targetRoute}${queryStr}`;
      window.history.pushState({}, '', fullUrl);
      setCurrentRoute(targetRoute);
      setQueryParams(newParams);
    }

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

  // On GitHub Pages, format href with hash for graceful middle-clicks or new tabs
  const href = isGitHubPagesOrStatic() ? `#${to}` : to;

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};
