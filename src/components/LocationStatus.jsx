import { useEffect, useState } from 'react'

export default function LocationStatus({ onLocation, disabled }) {
  const [coords, setCoords] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const getLocation = () => {
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        const data = { latitude, longitude, accuracy }
        setCoords(data)
        setLoading(false)
        onLocation && onLocation(data)
      },
      (err) => {
        setError(err.message || 'Location error')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  useEffect(() => {
    if (!disabled) getLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled])

  return (
    <div className="p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">Current Location</h3>
        <button
          type="button"
          onClick={getLocation}
          disabled={loading || disabled}
          className="text-sm px-3 py-1.5 rounded bg-gray-800 text-white disabled:opacity-50"
        >
          {loading ? 'Locating…' : 'Refresh'}
        </button>
      </div>
      {coords ? (
        <div className="text-sm text-gray-700 space-y-1">
          <p>Latitude: <span className="font-mono">{coords.latitude.toFixed(6)}</span></p>
          <p>Longitude: <span className="font-mono">{coords.longitude.toFixed(6)}</span></p>
          <p>Accuracy: <span className="font-mono">{Math.round(coords.accuracy)}</span> m</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No location yet.</p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
