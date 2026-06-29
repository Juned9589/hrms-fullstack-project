import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMeApi } from '../../api/auth.api';
import useAuthStore from '../../store/auth.store';
import Spinner from '../ui/Spinner';

export default function AuthBootstrap({ children }) {
  const { isAuthenticated, token, setUser, logout } = useAuthStore();

  // Only run /auth/me on page refresh (when token exists in persisted store)
  // NOT on fresh login — login already sets the user via setAuth
  const isPageRefresh = useRef(true);

  const { isLoading, isError, data: meUser } = useQuery({
    queryKey: ['authMe'],
    queryFn: getMeApi,
    // Only fetch on page load when already authenticated (refresh scenario)
    // Skip if this is a fresh login (user already set by setAuth)
    enabled: isAuthenticated && !!token && isPageRefresh.current,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    // After first render, mark as no longer a page refresh
    isPageRefresh.current = false;
  }, []);

  useEffect(() => {
    if (meUser) setUser(meUser);
  }, [meUser, setUser]);

  useEffect(() => {
    // Only logout on error if this was a refresh check (not fresh login)
    if (isError) logout();
  }, [isError, logout]);

  // Show spinner only on page refresh auth check, not on login
  if (isAuthenticated && isLoading && isPageRefresh.current) {
    return <Spinner fullPage />;
  }

  return children;
}