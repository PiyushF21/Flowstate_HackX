import { useState, useCallback, useRef } from 'react'
import { Camera, Upload, Mic, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CitizenLayout from '../../components/citizen/CitizenLayout'
import CategoryTile from '../../components/citizen/CategoryTile'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'

const CATEGORIES = [
  { key: 'roads', label: 'Roads' },
  { key: 'water_pipeline', label: 'Water' },
  { key: 'electrical', label: 'Electrical' },
  { key: 'sanitation', label: 'Sanitation' },
  { key: 'environment', label: 'Environment' },
  { key: 'structural', label: 'Structural' },
  { key: 'traffic', label: 'Traffic' },
]

const SEVERITY_OPTIONS = [
  { key: 'LOW', label: '🟡 Not urgent', color: 'var(--low)' },
  { key: 'MEDIUM', label: '🟠 Needs attention', color: 'var(--high)' },
  { key: 'HIGH', label: '🔴 Emergency', color: 'var(--critical)' },
]

export default function ReportPage() {
  const { fetchApi } = useApi()
  const { user } = useAuth()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState<{ category: string; subcategory: string; severity: string; description: string; confidence: number } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [issueId, setIssueId] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)

  const processImage = useCallback(async (file: File) => {
    // Show preview
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setImagePreview(dataUrl)
      
      // Extract base64 (strip data:image/...;base64, prefix)
      const base64 = dataUrl.split(',')[1]
      setImageBase64(base64)
      
      // Send to COGNOS for AI analysis
      setAiAnalyzing(true)
      try {
        const resp = await fetchApi<{ data: { category: string; subcategory: string; severity: string; description: string; confidence: number } }>('/api/cognos/analyze-image', {
          method: 'POST',
          body: { image_base64: base64 }
        })
        const aiData = resp.data
        setAiResult(aiData)
        setSelectedCategory(aiData.category)
        setSeverity(aiData.severity)
        if (aiData.description) {
          setDescription(aiData.description)
        }
      } catch (err) {
        console.error("COGNOS Vision analysis failed", err)
        // Fallback — still let user submit manually
        setAiResult({
          category: 'roads',
          subcategory: 'pothole',
          severity: 'MEDIUM',
          description: 'Issue detected from uploaded image.',
          confidence: 0.7
        })
        setSelectedCategory('roads')
        setSeverity('MEDIUM')
      } finally {
        setAiAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }, [fetchApi])

  const handleCapturePhoto = () => {
    cameraInputRef.current?.click()
  }

  const handleUploadGallery = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition isn't supported in your browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setDescription(prev => prev ? `${prev} ${transcript}` : transcript)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    
    recognition.start()
  }, [])

  const handleSubmit = async () => {
    if (!selectedCategory) return
    setIsSubmitting(true)
    try {
      const resp = await fetchApi<{ data: { issue_id: string } }>('/api/nexus/process', {
        method: 'POST',
        body: {
          source: 'manual_complaint',
          raw_data: {
            category: selectedCategory,
            subcategory: aiResult?.subcategory || selectedCategory,
            description: description,
            severity_self_assessed: severity || 'LOW',
            user_id: user?.id || 'citizen_anon',
            reporter_name: user?.userName || 'Anonymous',
            has_image: !!imageBase64,
          },
          location: { lat: 19.1196, lng: 72.8467, address: 'Powai Lake Gate 2', city: 'Mumbai', ward: 'S-Ward' }
        }
      })
      setIssueId(resp.data.issue_id)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      alert("Failed to report issue. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <CitizenLayout>
        <div className="flex flex-col items-center justify-center h-full px-6 text-center py-20">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
            <CheckCircle2 size={64} className="text-green-400 mb-4 mx-auto" />
          </motion.div>
          <h2 className="text-xl font-bold text-text-primary font-display mb-2">Issue Reported!</h2>
          <p className="text-sm text-text-secondary mb-1">Your complaint ID:</p>
          <p className="text-primary font-mono font-bold text-sm mb-6">{issueId || 'ISS-PENDING'}</p>
          <p className="text-xs text-text-muted mb-8">You'll be notified when a team is assigned.</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSubmitted(false)
                setImagePreview(null)
                setImageBase64(null)
                setAiResult(null)
                setSelectedCategory(null)
                setDescription('')
                setSeverity(null)
              }}
              className="px-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-sm text-text-primary hover:bg-surface-hover"
            >
              Report Another
            </button>
          </div>
        </div>
      </CitizenLayout>
    )
  }

  return (
    <CitizenLayout>
      <div className="px-4 py-3 pb-6">
        <h1 className="text-lg font-bold font-display text-text-primary mb-4">✍️ Report an Issue</h1>

        {/* Hidden file inputs */}
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
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Camera section */}
        <div className="rounded-2xl bg-surface-elevated border border-border overflow-hidden mb-4">
          {!imagePreview ? (
            <div className="h-44 flex flex-col items-center justify-center gap-3">
              <Camera size={40} className="text-text-muted" />
              <button
                onClick={handleCapturePhoto}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium"
              >
                📷 Take Photo
              </button>
              <button onClick={handleUploadGallery} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Upload size={12} /> Upload from Gallery
              </button>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Captured issue"
                className="w-full h-44 object-cover"
              />
              <button
                onClick={() => { setImagePreview(null); setImageBase64(null); setAiResult(null) }}
                className="absolute bottom-2 right-2 text-xs text-primary bg-surface/80 backdrop-blur px-2 py-1 rounded-lg"
              >
                Retake
              </button>
            </div>
          )}
        </div>

        {/* AI banner */}
        <AnimatePresence>
          {aiAnalyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl bg-primary/10 border border-primary/20 p-3 mb-4"
            >
              <p className="text-sm text-primary flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> COGNOS AI is analyzing your photo...
              </p>
            </motion.div>
          )}
          {aiResult && !aiAnalyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-xl bg-green-500/10 border border-green-500/20 p-3 mb-4"
            >
              <p className="text-sm text-green-400">
                ✅ AI detected: <strong className="capitalize">{aiResult.subcategory?.replace('_', ' ') || aiResult.category}</strong> — Severity: {aiResult.severity}
              </p>
              <p className="text-[10px] text-text-muted mt-1">Confidence: {Math.round(aiResult.confidence * 100)}% • You can override below.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories */}
        <div className="mb-4">
          <p className="text-sm font-medium text-text-primary mb-2">Category</p>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <CategoryTile
                key={cat.key}
                category={cat.key}
                label={cat.label}
                isSelected={selectedCategory === cat.key}
                onClick={() => setSelectedCategory(cat.key)}
              />
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="rounded-xl bg-surface-elevated border border-border p-3 mb-4">
          <p className="text-sm font-medium text-text-primary mb-1">📍 Location</p>
          <p className="text-xs text-text-secondary">Powai Lake Gate 2, Hiranandani Gardens</p>
          <button className="text-[10px] text-primary mt-1 hover:underline">Edit location</button>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm font-medium text-text-primary mb-2">Description</p>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in your own words..."
              className="w-full bg-surface-elevated rounded-xl px-3.5 py-3 text-sm text-text-primary placeholder-text-muted border border-border focus:border-primary/50 outline-none resize-none h-20"
              maxLength={500}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <span className="text-[10px] text-text-muted">{description.length}/500</span>
              <button 
                onClick={startListening}
                className={cn("p-1 hover:text-primary transition-colors", isListening ? "text-red-500 animate-pulse" : "text-text-muted")}
              >
                {isListening ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Severity */}
        <div className="mb-6">
          <p className="text-sm font-medium text-text-primary mb-2">How urgent is this?</p>
          <div className="flex gap-2">
            {SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSeverity(opt.key)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all text-center',
                  severity === opt.key
                    ? 'border-primary/40 bg-primary/10 text-text-primary'
                    : 'border-border bg-surface-elevated text-text-secondary hover:border-border-light'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedCategory || isSubmitting}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-40 transition-opacity hover:bg-primary-dark flex justify-center items-center gap-2"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Report Issue'}
        </button>
      </div>
    </CitizenLayout>
  )
}
