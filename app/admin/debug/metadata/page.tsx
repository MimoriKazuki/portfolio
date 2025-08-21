'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function MetadataDebugPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [metadata, setMetadata] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkMetadata = async () => {
    if (!url) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError(null)
    setMetadata(null)

    try {
      const response = await fetch(`/api/debug/metadata?url=${encodeURIComponent(url)}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fetch metadata')
      } else {
        setMetadata(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const testUrls = [
    { label: 'Home', url: 'https://www.landbridge.ai' },
    { label: 'Projects List', url: 'https://www.landbridge.ai/projects' },
    { label: 'Sample Project', url: 'https://www.landbridge.ai/projects/550e8400-e29b-41d4-a716-446655440000' },
    { label: 'Columns List', url: 'https://www.landbridge.ai/columns' },
    { label: 'Sample Column', url: 'https://www.landbridge.ai/columns/sample-slug' },
  ]

  return (
    <div className="p-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        管理画面に戻る
      </Link>

      <h1 className="text-2xl font-bold mb-6">Metadata Debug Tool</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL to check
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.landbridge.ai/projects/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={checkMetadata}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Metadata'}
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Quick test URLs:</p>
          <div className="flex flex-wrap gap-2">
            {testUrls.map((testUrl) => (
              <button
                key={testUrl.url}
                onClick={() => setUrl(testUrl.url)}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                {testUrl.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {metadata && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Basic Metadata</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Title:</strong> {metadata.title || 'Not found'}</p>
                <p><strong>Canonical URL:</strong> {metadata.canonical || 'Not found'}</p>
                <p><strong>Fetched at:</strong> {metadata.fetchedAt}</p>
              </div>
            </div>

            {metadata.openGraph && Object.keys(metadata.openGraph).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Open Graph Tags</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(metadata.openGraph, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {metadata.twitter && Object.keys(metadata.twitter).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Twitter Card Tags</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(metadata.twitter, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {metadata.nextjs && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Next.js Info</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(metadata.nextjs, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold mb-2">All Meta Tags</h2>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-sm">
                  {JSON.stringify(metadata.metaTags, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Response Headers</h2>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-sm">
                  {JSON.stringify(metadata.headers, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Production Metadata Issues to Check:</h3>
        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
          <li>Check if metadata differs between development and production</li>
          <li>Verify that dynamic routes are generating metadata correctly</li>
          <li>Look for caching headers that might prevent metadata updates</li>
          <li>Check if ISR (revalidate) is working as expected</li>
          <li>Verify that the middleware isn't interfering with metadata</li>
          <li>Check for any build errors related to metadata generation</li>
        </ul>
      </div>
    </div>
  )
}