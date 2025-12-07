"use client";
import { CopyButtonIcon } from "@/icons/CopyButtonIcon";
import GmailIcon from "../icons/GmailIcon";
import LinkedInIcon from "../icons/LinkedInIcon";
import WhatsAppIcon from "../icons/WhatsAppIcon";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import useThemeStore from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseUrl, setResponseUrl] = useState("");
  const [message, setMessage] = useState(false);
  const [originalUrl, setOriginalUrl] = useState("");
  const { theme } = useThemeStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check if there's a URL in localStorage (persisted state)
    const savedUrl = localStorage.getItem('lastShortenedUrl');
    if (savedUrl) {
      setResponseUrl(savedUrl);
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!originalUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      setIsSubmitting(true);
      setResponseUrl("");

      const token = localStorage.getItem('token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ originalUrl }),
      });

      if (response.status === 429) {
        toast.error("Too Many Requests. Please try again later.");
        return;
      } else if (response.status === 400) {
        toast.error("Invalid URL. Please check and try again.");
        return;
      } else if (response.status === 401) {
        toast.error("Please login to shorten URLs");
        router.push("/auth/login");
        return;
      } else if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }

      const responseData = await response.json();
      setResponseUrl(responseData.shortUrl || responseData);

      // Save to localStorage for persistence
      localStorage.setItem('lastShortenedUrl', responseData.shortUrl || responseData);

      toast.success("URL shortened successfully!");
    } catch (error) {
      console.log("error:", error);
      toast.error("Failed to shorten URL. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(responseUrl);
    setMessage(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => {
      setMessage(false);
    }, 2000);
  };

  const handleShare = (platform: 'whatsapp' | 'gmail' | 'linkedin') => {
    const text = `Check out this shortened URL: ${responseUrl}`;
    let url = '';

    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        break;
      case 'gmail':
        url = `mailto:?subject=Check this shortened URL&body=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(responseUrl)}`;
        break;
    }

    window.open(url, '_blank');
  };

  return (
    <div className={`${theme} min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800`}>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            background: theme === 'dark' ? '#1f2937' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
          },
        }}
      />

      <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        {/* Welcome message for logged in users */}
        {isAuthenticated && user && (
          <div className="mb-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Welcome back, <span className="font-semibold text-blue-600 dark:text-blue-400">{user.name}</span>! 👋
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ready to shorten some URLs?
            </p>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Image
                src={"/http.png"}
                alt="URL Shortener Logo"
                height={80}
                width={160}
                className="filter dark:invert"
                priority
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-600 dark:text-gray-300 mb-3">
            Tired of long, messy URLs?
          </h2>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Make Your <span className="text-blue-600 dark:text-blue-400">URL</span> Short
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Transform long links into short, memorable URLs that are perfect for sharing anywhere.
          </p>
        </div>

        {/* URL Shortener Form */}
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter your long URL
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="url"
                  id="originalUrl"
                  name="originalUrl"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="flex-grow px-6 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="https://example.com/very-long-url-path"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Shortening...
                    </div>
                  ) : (
                    "Shorten It!"
                  )}
                </button>
              </div>
            </div>

            {/* Stats/Info for logged in users */}
            {isAuthenticated && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-blue-700 dark:text-blue-300">You&apos;re logged in! Your URLs will be saved to your account.</span>
                  </div>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    View Dashboard →
                  </Link>
                </div>
              </div>
            )}
          </form>

          {/* Shortened URL Display */}
          {responseUrl && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Your Shortened URL
                  </h3>

                  <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="flex-grow">
                      <Link
                        href={responseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium break-all"
                      >
                        {responseUrl}
                      </Link>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                    >
                        <CopyButtonIcon />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                {/* Share Options */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Share your shortened URL:</h4>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                    >
                        <WhatsAppIcon />
                      <span className="font-medium">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleShare('gmail')}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                    >
                        <GmailIcon />
                      <span className="font-medium">Gmail</span>
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl transition-colors"
                    >
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center p-1">
                        <LinkedInIcon />
                      </div>
                      <span className="font-medium">LinkedIn</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="w-full max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose Short.Url?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate shortened URLs instantly with our optimized infrastructure.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Secure & Reliable</h3>
              <p className="text-gray-600 dark:text-gray-400">
                All URLs are encrypted and tracked with enterprise-grade security.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Easy Sharing</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Share your links effortlessly across multiple platforms with one click.
              </p>
            </div>
          </div>
        </div>

        {/* CTA for non-logged in users */}
        {!isAuthenticated && (
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                Get More Features with an Account!
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Sign up for free to track your URL analytics, create custom short links, and manage all your links in one dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/auth/signup")}
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Sign Up Free
                </button>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                >
                  Already have an account? Login
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}