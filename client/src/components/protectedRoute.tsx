// components/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);
      try {
        await checkAuth();
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifyAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated && !isLoading) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, isCheckingAuth, router]);

  // Show loading spinner while checking authentication
  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading, don't render children
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;