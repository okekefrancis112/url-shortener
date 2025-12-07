// app/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { urlService } from "@/services/urlService";
import { ShortenedUrl } from "@/types/url";
import {
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import ProtectedRoute from "@/components/protectedRoute";
import Link from "next/link";

const DashboardPage = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [newUrl, setNewUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'urls'>('overview');
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const router = useRouter();

  // Helper function to construct full URL
  const getFullShortUrl = useCallback((shortId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || 'http://localhost:8080';
    return `${baseUrl}/${shortId}`;
  }, []);

  // Helper to get display URL (truncated)
  const getDisplayUrl = useCallback((shortId: string) => {
    const fullUrl = getFullShortUrl(shortId);
    return fullUrl.length > 40 ? `${fullUrl.substring(0, 37)}...` : fullUrl;
  }, [getFullShortUrl]);

  // Fetch user URLs
  const fetchUserUrls = useCallback(async () => {
    try {
      setLoading(true);
      const userId = user?._id || user?.id;

      if (!userId) {
        toast.error("User not found. Please login again.");
        return;
      }

      const response = await urlService.getUserUrls(userId);

      // Construct full short URLs
      const urlsWithFullPath = (response.data || []).map((url: any) => ({
        ...url,
        shortUrl: url.shortUrl || getFullShortUrl(url.shortId)
      }));

      setUrls(urlsWithFullPath);
    } catch (error: any) {
      console.error('Error fetching URLs:', error);

      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        toast.error("Session expired. Please login again.");
        router.push('/login');
      } else {
        toast.error('Failed to load your URLs');
      }
    } finally {
      setLoading(false);
    }
  }, [user, getFullShortUrl, router]);

  useEffect(() => {
    if (user?._id || user?.id) {
      fetchUserUrls();
    }
  }, [user, fetchUserUrls]);

  useEffect(() => {
    if (urls.length > 0) {
      const analyticsData = urlService.getAnalytics(urls);
      setAnalytics(analyticsData);
    } else {
      setAnalytics({
        totalUrls: 0,
        totalClicks: 0,
        clicksLast7Days: 0,
        popularUrls: []
      });
    }
  }, [urls, urlService]);

  const handleCreateShortUrl = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(newUrl);
    } catch {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    try {
      setIsCreating(true);
      await urlService.createShortUrl(newUrl);
      toast.success('URL shortened successfully!');
      setNewUrl("");
      await fetchUserUrls(); // Refresh the list
    } catch (error: any) {
      console.error('Error creating short URL:', error);

      if (error.message.includes('400')) {
        toast.error('Invalid URL. Please check and try again.');
      } else if (error.message.includes('429')) {
        toast.error('Too many requests. Please try again later.');
      } else if (error.message.includes('401')) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
      } else {
        toast.error('Failed to shorten URL. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUrl = async (urlId: string) => {
    if (!confirm('Are you sure you want to delete this URL? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(urlId);
      await urlService.deleteUrl(urlId);
      toast.success('URL deleted successfully');

      // Update local state
      const updatedUrls = urls.filter(url => url._id !== urlId);
      setUrls(updatedUrls);

      // Update analytics
      if (updatedUrls.length > 0) {
        const analyticsData = urlService.getAnalytics(updatedUrls);
        setAnalytics(analyticsData);
      } else {
        setAnalytics({
          totalUrls: 0,
          totalClicks: 0,
          clicksLast7Days: 0,
          popularUrls: []
        });
      }
    } catch (error: any) {
      console.error('Error deleting URL:', error);

      if (error.message.includes('404')) {
        toast.error('URL not found. It may have already been deleted.');
        fetchUserUrls(); // Refresh to get current state
      } else if (error.message.includes('401') || error.message.includes('403')) {
        toast.error('You do not have permission to delete this URL.');
      } else {
        toast.error('Failed to delete URL. Please try again.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (text: string, urlId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(urlId);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const filteredUrls = urls.filter(url =>
    url.originalUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.shortUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.shortId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <Toaster position="top-right" />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Welcome back, <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.name}</span>! Manage all your shortened URLs here.
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <ChartBarIcon className="w-5 h-5 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('urls')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'urls'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <LinkIcon className="w-5 h-5 inline mr-2" />
                My URLs ({urls.length})
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total URLs
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics?.totalUrls || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <EyeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Clicks
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics?.totalClicks || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Last 7 Days
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics?.clicksLast7Days || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create New URL Form */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Create New Short URL
                </h2>
                <form onSubmit={handleCreateShortUrl} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="url"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://example.com/very-long-url"
                      className="flex-grow px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                    >
                      {isCreating ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <PlusIcon className="w-5 h-5 mr-2" />
                          Shorten URL
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Most Popular URLs */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Most Popular URLs
                </h2>
                {analytics?.popularUrls?.length > 0 ? (
                    <div className="space-y-4">
                    {analytics.popularUrls.map((url: ShortenedUrl) => {
                        const fullShortUrl = url.shortUrl || getFullShortUrl(url.shortId);
                        const displayUrl = getDisplayUrl(url.shortId);

                        return (
                        <div key={url._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0"> {/* Add min-w-0 for flexbox truncation */}
                                {/* Original URL with proper truncation */}
                                <p
                                className="text-sm text-gray-500 dark:text-gray-400 truncate"
                                title={url.originalUrl} // Add tooltip on hover
                                >
                                {url.originalUrl}
                                </p>

                                <div className="flex flex-col sm:flex-row sm:items-center mt-1 gap-2">
                                {/* Short URL with truncation */}
                                <div className="flex-1 min-w-0">
                                    <Link
                                    href={fullShortUrl}
                                    target="_blank"
                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium truncate block"
                                    title={fullShortUrl} // Add tooltip
                                    >
                                    {displayUrl}
                                    </Link>
                                </div>

                                {/* Clicks counter */}
                                <div className="flex-shrink-0">
                                    <span className="flex items-center text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    <EyeIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                                    {url.clicks || 0} clicks
                                    </span>
                                </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex space-x-2 flex-shrink-0">
                                <button
                                onClick={() => handleCopy(fullShortUrl, url._id)}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                title="Copy URL"
                                >
                                <ClipboardDocumentIcon className="w-5 h-5" />
                                </button>
                                <Link
                                href={fullShortUrl}
                                target="_blank"
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                title="Open URL"
                                >
                                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                </Link>
                            </div>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No URLs created yet. Create your first short URL above!
                    </p>
                )}
                </div>
            </div>
          )}

          {/* URLs Tab */}
          {activeTab === 'urls' && (
            <div className="space-y-6">
              {/* Search and Stats */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search URLs by original or short URL..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredUrls.length} of {urls.length} URLs
                </div>
              </div>

              {/* URLs Table */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your URLs...</p>
                </div>
              ) : filteredUrls.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Original URL
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Short URL
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Clicks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUrls.map((url) => {
                          const fullShortUrl = url.shortUrl || getFullShortUrl(url.shortId);
                          const displayUrl = getDisplayUrl(url.shortId);

                          return (
                            <tr key={url._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white truncate max-w-xs" title={url.originalUrl}>
                                  {url.originalUrl}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <Link
                                    href={fullShortUrl}
                                    target="_blank"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs"
                                    title={fullShortUrl}
                                  >
                                    {displayUrl}
                                  </Link>
                                  <button
                                    onClick={() => handleCopy(fullShortUrl, url._id)}
                                    className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                                    title="Copy URL"
                                  >
                                    <ClipboardDocumentIcon className={`w-4 h-4 ${
                                      copiedId === url._id
                                        ? 'text-green-500'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                    }`} />
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <EyeIcon className="w-4 h-4 text-gray-400 mr-1" />
                                  <span className="text-sm text-gray-900 dark:text-white">
                                    {url.clicks || 0}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(url.createdAt)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => handleCopy(fullShortUrl, url._id)}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
                                    title="Copy URL"
                                    disabled={copiedId === url._id}
                                  >
                                    {copiedId === url._id ? 'Copied!' : 'Copy'}
                                  </button>
                                  <Link
                                    href={fullShortUrl}
                                    target="_blank"
                                    className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                                    title="Open URL"
                                  >
                                    Open
                                  </Link>
                                  <button
                                    onClick={() => handleDeleteUrl(url._id)}
                                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50"
                                    title="Delete URL"
                                    disabled={deletingId === url._id}
                                  >
                                    {deletingId === url._id ? 'Deleting...' : 'Delete'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
                  {searchTerm ? (
                    <>
                      <div className="mx-auto w-16 h-16 text-gray-400">
                        <EyeSlashIcon className="w-full h-full" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                        No URLs found
                      </h3>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">
                        No URLs match your search criteria.
                      </p>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-4 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Clear Search
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto w-16 h-16 text-gray-400">
                        <LinkIcon className="w-full h-full" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                        No URLs yet
                      </h3>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Create your first short URL to get started.
                      </p>
                      <button
                        onClick={() => setActiveTab('overview')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create Short URL
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;