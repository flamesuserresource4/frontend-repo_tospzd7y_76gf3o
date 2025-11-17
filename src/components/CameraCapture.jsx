import { useRef, useState, useEffect } from 'react'

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [photoData, setPhotoData] = useState(null)

  const startCamera = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setStreaming(true)
      }
    } catch (e) {
      setError(e.message || 'Unable to access camera')
    }
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
    }
    setStreaming(false)
  }

  const takePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const w = video.videoWidth || 640
    const h = video.videoHeight || 480
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, w, h)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setPhotoData(dataUrl)
    onCapture && onCapture(dataUrl)
  }

  useEffect(() => {
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">Selfie (optional)</h3>
        {!streaming ? (
          <button onClick={startCamera} className="text-sm px-3 py-1.5 rounded bg-gray-800 text-white">Start</button>
        ) : (
          <button onClick={stopCamera} className="text-sm px-3 py-1.5 rounded bg-gray-600 text-white">Stop</button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <video ref={videoRef} autoPlay playsInline className="w-full rounded bg-black/5" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-2">
          <button onClick={takePhoto} disabled={!streaming} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Capture</button>
          {photoData && <span className="text-sm text-gray-600">Captured</span>}
        </div>
        {photoData && (
          <img src={photoData} alt="Selfie" className="w-32 h-32 object-cover rounded-md border" />
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
