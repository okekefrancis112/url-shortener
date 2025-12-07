"use client";

import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import useThemeStore from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore"; // Add this import
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { theme, setTheme } = useThemeStore();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkAuth();


    const storedTheme = localStorage.getItem("theme") as "dark" | "light" | null;

    if (storedTheme && (storedTheme === "dark" || storedTheme === "light")) {
      setTheme(storedTheme);
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setTheme(systemTheme);
    }
  }, [setTheme, checkAuth]);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      const storedTheme = localStorage.getItem("theme");
      if (!storedTheme) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mounted, setTheme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleHomeClick = () => {
    router.push("/");
  };

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    router.push("/");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-between py-3 px-5 bg-nt text-inv drop-shadow-lg">
        <div className="flex items-center">
          <div className="cursor-pointer flex items-center">
            <Image
              src="/chain.png"
              alt="logo"
              height="24"
              width="24"
              className="opacity-0"
            />
            <h1 className="ml-3 text-2xl font-extrabold">Short.Url</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-8 rounded-md bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <div className="w-20 h-8 rounded-md bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <div className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <header
      className={`flex items-center justify-between py-3 px-5 bg-nt text-inv drop-shadow-lg transition-colors duration-200 fixed top-0 left-0 right-0 z-50 ${
        theme === "dark" ? "dark" : ""
      }`}
      role="banner"
    >
      {/* Logo/Home Link */}
      <div
        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-200"
        onClick={handleHomeClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleHomeClick();
          }
        }}
      >
        <Image
          src="/chain.png"
          alt="Short.Url Logo - A chain link symbol"
          height="24"
          width="24"
          className={`transition-all duration-200 ${
            theme === "dark" ? "invert" : ""
          }`}
          priority
        />
        <h1 className="ml-3 text-2xl font-extrabold">
          <span className="sr-only">Short.Url - URL Shortening Service</span>
          <span aria-hidden="true">Short.Url</span>
        </h1>
      </div>

      {/* Right side: Conditionally show auth buttons or user dropdown */}
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          // User is logged in - show user dropdown
          <div className="relative user-dropdown">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-expanded={showDropdown}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden md:inline font-medium">
                {user?.name || 'User'}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowDropdown(false)}
                    role="menuitem"
                  >
                    Dashboard
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // User is not logged in - show auth buttons
          <>
            <button
              onClick={() => router.push("/auth/signup")}
              className="px-4 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Sign Up
            </button>
            <button
              onClick={() => router.push("/auth/login")}
              className="px-4 py-2 rounded-md font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Login
            </button>
          </>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Navbar;