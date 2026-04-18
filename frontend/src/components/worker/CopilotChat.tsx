import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Mic, MicOff, Bot, Volume2, VolumeX, Wrench, HelpCircle, FileText, Globe, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { useApi } from '../../hooks/useApi'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
  audioBase64?: string  // Sarvam TTS audio
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', speechCode: 'en-IN' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳', speechCode: 'mr-IN' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳', speechCode: 'ta-IN' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳', speechCode: 'te-IN' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳', speechCode: 'kn-IN' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳', speechCode: 'bn-IN' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳', speechCode: 'gu-IN' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳', speechCode: 'ml-IN' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', speechCode: 'pa-IN' },
]

const QUICK_ACTIONS = [
  { icon: Wrench, label: 'How to fix this?', prompt: 'How do I fix the current task?' },
  { icon: HelpCircle, label: 'Safety tips', prompt: 'What safety precautions should I take?' },
  { icon: FileText, label: 'Material list', prompt: 'What materials do I need for this task?' },
]

export default function CopilotChat({ className }: { className?: string }) {
  const { fetchApi } = useApi()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      text: "Hi Ganesh! I'm your FIELD_COPILOT 🤖. I can help with technical guidance, safety procedures, and troubleshooting in multiple languages. What do you need help with?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [language, setLanguage] = useState('en')
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)

  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  // Stop any playing audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
  }, [])

  // Play TTS audio from Sarvam AI
  const playTTS = useCallback(async (text: string, msgId: string) => {
    stopAudio()
    setIsSpeaking(true)
    
    try {
      const data = await fetchApi<{ audio_base64: string; content_type: string }>('/api/field-copilot/tts', {
        method: 'POST',
        body: { text, language }
      })
      
      if (data?.audio_base64) {
        // Store audio in message for replay
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, audioBase64: data.audio_base64 } : m))
        
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0))],
          { type: data.content_type || 'audio/wav' }
        )
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audioRef.current = audio
        
        audio.onended = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }
        audio.onerror = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }
        
        await audio.play()
      } else {
        setIsSpeaking(false)
      }
    } catch (err) {
      console.error('TTS error:', err)
      setIsSpeaking(false)
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = selectedLang.speechCode
        utterance.onend = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
      }
    }
  }, [fetchApi, language, selectedLang.speechCode, stopAudio])

  const addMessage = useCallback((role: 'user' | 'assistant', text: string): string => {
    const msgId = Date.now().toString()
    const msg: Message = { id: msgId, role, text, timestamp: new Date() }
    setMessages(prev => [...prev, msg])
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100)
    return msgId
  }, [])

  const handleSend = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg) return
    addMessage('user', msg)
    setInput('')
    
    stopAudio()
    setIsTyping(true)
    
    try {
      const data = await fetchApi<{ reply: string; safety_warning: string }>('/api/field-copilot/chat', {
        method: 'POST',
        body: { worker_id: 'WRK-MUM-015', message: msg, issue_id: 'ISS-MUM-2026-04-17-0042', language }
      })
      setIsTyping(false)
      const reply = data.reply || 'No guidance available for this query.'
      const warning = data.safety_warning ? `\n\n⚠️ Safety: ${data.safety_warning}` : ''
      const fullReply = reply + warning
      const msgId = addMessage('assistant', fullReply)
      
      // Auto-speak the reply using Sarvam TTS
      if (autoSpeak) {
        // Small delay so the message renders first
        setTimeout(() => playTTS(reply, msgId), 300)
      }
    } catch (err) {
      setIsTyping(false)
      addMessage('assistant', "Network Error. Unable to reach FIELD_COPILOT.")
    }
  }

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition isn't supported in your browser.")
      return
    }

    stopAudio()

    const recognition = new SpeechRecognition()
    recognition.lang = selectedLang.speechCode
    recognition.continuous = false
    recognition.interimResults = false
    recognitionRef.current = recognition

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = async (event: any) => {
      setIsListening(false)
      const voiceText = event.results[0][0].transcript
      addMessage('user', '🎤 ' + voiceText)
      
      stopAudio()
      setIsTyping(true)
      
      try {
        const data = await fetchApi<{ reply: string; safety_warning: string }>('/api/field-copilot/chat', {
          method: 'POST',
          body: { worker_id: 'WRK-MUM-015', message: voiceText, issue_id: 'ISS-MUM-2026-04-17-0042', language }
        })
        setIsTyping(false)
        const reply = data.reply || 'No guidance available for this query.'
        const warning = data.safety_warning ? `\n\n⚠️ Safety: ${data.safety_warning}` : ''
        const fullReply = reply + warning
        const msgId = addMessage('assistant', fullReply)
        
        if (autoSpeak) {
          setTimeout(() => playTTS(reply, msgId), 300)
        }
      } catch (err) {
        setIsTyping(false)
        addMessage('assistant', "Network Error. Unable to reach FIELD_COPILOT.")
      }
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognition.start()
  }

  // Replay audio for a specific message
  const replayAudio = (msg: Message) => {
    if (msg.audioBase64) {
      stopAudio()
      setIsSpeaking(true)
      const audioBlob = new Blob(
        [Uint8Array.from(atob(msg.audioBase64), c => c.charCodeAt(0))],
        { type: 'audio/wav' }
      )
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(audioUrl) }
      audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(audioUrl) }
      audio.play()
    } else {
      playTTS(msg.text, msg.id)
    }
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Language selector + auto-speak toggle */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-white/[0.04] bg-bg/50">
        {/* Language Picker */}
        <div className="relative">
          <button 
            onClick={() => setShowLangPicker(!showLangPicker)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated text-sm text-text-primary border border-white/[0.06] hover:border-white/[0.12] transition-all"
          >
            <Globe size={14} className="text-agent-field-copilot" />
            <span>{selectedLang.flag} {selectedLang.name}</span>
            <ChevronDown size={12} className={cn("transition-transform", showLangPicker && "rotate-180")} />
          </button>
          
          <AnimatePresence>
            {showLangPicker && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="absolute top-full left-0 mt-1 w-52 bg-[#1C1D24] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden max-h-[280px] overflow-y-auto scrollbar-none"
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setShowLangPicker(false) }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors",
                      lang.code === language
                        ? "bg-agent-field-copilot/15 text-agent-field-copilot font-medium"
                        : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
                    )}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {lang.code === language && <span className="ml-auto text-agent-field-copilot">✓</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Auto-speak toggle */}
        <button
          onClick={() => { setAutoSpeak(!autoSpeak); if (isSpeaking) stopAudio() }}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all",
            autoSpeak
              ? "bg-agent-field-copilot/15 text-agent-field-copilot border border-agent-field-copilot/20"
              : "bg-surface-elevated text-text-muted border border-white/[0.06]"
          )}
        >
          {autoSpeak ? <Volume2 size={12} /> : <VolumeX size={12} />}
          {autoSpeak ? 'Voice On' : 'Voice Off'}
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/[0.04]">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => handleSend(action.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-elevated border border-white/[0.06] text-[10px] font-medium text-text-secondary hover:text-text-primary hover:border-agent-field-copilot/40 whitespace-nowrap transition-all"
          >
            <action.icon size={12} /> {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-agent-field-copilot/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={14} className="text-agent-field-copilot" />
                </div>
              )}
              <div className="flex flex-col max-w-[80%]">
                <div className={cn(
                  'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-agent-commander text-white rounded-br-md'
                    : 'bg-surface-elevated text-text-primary rounded-bl-md border border-white/[0.06]'
                )}>
                  {msg.text}
                </div>
                {/* Replay audio button for assistant messages */}
                {msg.role === 'assistant' && msg.id !== '1' && (
                  <button
                    onClick={() => replayAudio(msg)}
                    className="self-start mt-1 flex items-center gap-1 text-[10px] text-text-muted hover:text-agent-field-copilot transition-colors"
                  >
                    <Volume2 size={10} /> Replay Audio
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <div className="flex gap-2 items-end">
            <div className="w-7 h-7 rounded-full bg-agent-field-copilot/10 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-agent-field-copilot" />
            </div>
            <div className="bg-surface-elevated rounded-2xl rounded-bl-md px-4 py-3 border border-white/[0.06]">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-critical/5 border-t border-critical/20"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-0.5 items-end h-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-critical rounded-full"
                    animate={{ height: [4, 16, 4] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
              <span className="text-xs text-critical font-medium">Listening in {selectedLang.name}...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speaking indicator */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-1.5 bg-agent-field-copilot/5 border-t border-agent-field-copilot/20"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-0.5 items-end h-3">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-agent-field-copilot rounded-full"
                    animate={{ height: [3, 12, 3] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-agent-field-copilot font-medium">Speaking...</span>
              <button onClick={stopAudio} className="text-[10px] text-text-muted hover:text-critical underline">Stop</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-white/[0.04]">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoice}
            className={cn(
              'p-2.5 rounded-xl transition-all relative',
              isListening ? 'bg-critical/20 text-critical animate-pulse' : 'bg-surface-elevated text-text-muted hover:text-text-secondary'
            )}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={language === 'en' ? 'Ask for help...' : `Type in ${selectedLang.name}...`}
            className="flex-1 bg-surface-elevated rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted border border-white/[0.06] focus:border-agent-field-copilot/50 outline-none transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-agent-field-copilot text-white disabled:opacity-30 transition-opacity"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
