import { useState, useRef } from 'react'
import { Camera, X, Upload, Loader2, ImageIcon } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface ProofUploadProps {
  onSubmit?: (photos: string[], notes: string) => void
}

export default function ProofUpload({ onSubmit }: ProofUploadProps) {
  const [photos, setPhotos] = useState<{ url: string; preview: string }[]>([])
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const resp = await fetch(`${API_BASE}/api/upload/file`, {
        method: 'POST',
        body: formData,
      })
      const data = await resp.json()

      // Create a local preview URL alongside the server URL
      const previewUrl = URL.createObjectURL(file)
      setPhotos((prev) => [...prev, { url: data.url, preview: previewUrl }])
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => uploadFile(file))
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const removePhoto = (idx: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const handleSubmit = () => {
    const urls = photos.map((p) => p.url)
    onSubmit?.(urls, notes)
  }

  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-3">
      <p className="text-sm font-medium text-text-primary mb-3">📸 Upload Proof</p>

      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {photos.map((photo, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-surface-hover">
            <img src={photo.preview} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => removePhoto(idx)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-critical text-white flex items-center justify-center"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {uploading && (
          <div className="aspect-square rounded-lg border-2 border-dashed border-primary/40 flex items-center justify-center">
            <Loader2 size={20} className="text-primary animate-spin" />
          </div>
        )}

        {/* Add buttons */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-0.5 transition-colors"
          >
            <Camera size={18} className="text-text-muted" />
            <span className="text-[9px] text-text-muted">Camera</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-0.5 transition-colors"
          >
            <Upload size={18} className="text-text-muted" />
            <span className="text-[9px] text-text-muted">Gallery</span>
          </button>
        </div>
      </div>

      <p className="text-[10px] text-text-muted mb-2">
        {photos.length < 2 ? `Min 2 photos required (before + after). ${2 - photos.length} more needed.` : '✅ Minimum photos met.'}
      </p>

      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Any additional comments?"
        className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted border border-border focus:border-primary/50 outline-none resize-none h-16 mb-3"
      />

      <button
        onClick={handleSubmit}
        disabled={photos.length < 2 || uploading}
        className="w-full py-2.5 rounded-xl bg-agent-commander text-white text-sm font-medium disabled:opacity-40 transition-opacity"
      >
        {uploading ? 'Uploading...' : 'Submit for Verification'}
      </button>
    </div>
  )
}
