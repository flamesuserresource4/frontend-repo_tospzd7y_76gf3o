import { useEffect, useMemo, useState } from 'react'
import LocationStatus from './components/LocationStatus'
import CameraCapture from './components/CameraCapture'

function App() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loc, setLoc] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const backendBase = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
  const maxAccuracy = 50 // meters

  const canSubmit = name && email && loc && loc.accuracy <= maxAccuracy && !submitting

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const payload = {
        name,
        email,
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy_m: loc.accuracy,
        photo_base64: photo || null,
      }

      const res = await fetch(`${backendBase}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || `Request failed: ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
      <header className="px-6 py-4 border-b bg-white/70 backdrop-blur sticky top-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Attendance</h1>
          <div className="text-sm text-gray-600">
            <a className="underline" href="/test">System Test</a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">Mark your attendance</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-700">Name</label>
                <input
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="jane@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <LocationStatus onLocation={setLoc} />
            <p className="text-xs text-gray-500">We request high-accuracy GPS. Accuracy must be ≤ 50 m.</p>

            <CameraCapture onCapture={setPhoto} />

            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Mark Attendance'}
            </button>

            {error && (
              <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
            )}
            {result && (
              <div className="p-3 rounded bg-green-50 text-green-700 text-sm">
                Attendance marked successfully at {result.data?.time} on {result.data?.date}.<br />
                Lat: {result.data?.latitude}, Lng: {result.data?.longitude}, Accuracy: {Math.round(result.data?.accuracy_m)} m
                {result.data?.photo_url && (
                  <div className="mt-2"><a className="underline" href={result.data.photo_url} target="_blank" rel="noreferrer">View Photo</a></div>
                )}
                {result.dashboard_url && (
                  <div className="mt-2"><a className="underline" href={result.dashboard_url} target="_blank" rel="noreferrer">Open Sheet</a></div>
                )}
              </div>
            )}
          </form>
        </div>

        <section className="text-xs text-gray-500">
          <p>Tip: For geofence enforcement, configure office coordinates in the backend environment.</p>
        </section>
      </main>
    </div>
  )
}

export default App
