import { useState } from 'react'
import { Camera, X } from 'lucide-react'

interface ProofUploadProps {
  onSubmit?: (photos: string[], notes: string) => void
}

export default function ProofUpload({ onSubmit }: ProofUploadProps) {
  const [photos, setPhotos] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const handleCapture = () => {
    // Simulate photo capture
    setPhotos((prev) => [...prev, `📸 Photo ${prev.length + 1}`])
  }

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-3">
      <p className="text-sm font-medium text-text-primary mb-3">📸 Upload Proof</p>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {photos.map((_, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg bg-surface-hover flex items-center justify-center">
            <span className="text-xl">📸</span>
            <button
              onClick={() => removePhoto(idx)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-critical text-white flex items-center justify-center"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <button
          onClick={handleCapture}
          className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-1 transition-colors"
        >
          <Camera size={20} className="text-text-muted" />
          <span className="text-[10px] text-text-muted">Add</span>
        </button>
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
        onClick={() => onSubmit?.(photos, notes)}
        disabled={photos.length < 2}
        className="w-full py-2.5 rounded-xl bg-agent-commander text-white text-sm font-medium disabled:opacity-40 transition-opacity"
      >
        Submit for Verification
      </button>
    </div>
  )
}
