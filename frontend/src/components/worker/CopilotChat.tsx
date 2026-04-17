import { useState, useRef } from 'react'
import { Send, Mic, MicOff, Bot, Wrench, HelpCircle, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { useApi } from '../../hooks/useApi'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
}

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
      text: "Hi Ganesh! I'm your FIELD_COPILOT 🤖. I can help with technical guidance, safety procedures, and troubleshooting. What do you need help with?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel() // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-IN'
      window.speechSynthesis.speak(utterance)
    }
  }

  const addMessage = (role: 'user' | 'assistant', text: string) => {
    const msg: Message = { id: Date.now().toString(), role, text, timestamp: new Date() }
    setMessages((prev) => [...prev, msg])
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100)
    
    if (role === 'assistant') {
      speak(text)
    }
  }

  const handleSend = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg) return
    addMessage('user', msg)
    setInput('')
    
    setIsTyping(true)
    try {
      const data = await fetchApi<{ response: string }>('/api/field-copilot/chat', {
        method: 'POST',
        body: { worker_id: 'WRK-MUM-015', message: msg, issue_id: 'ISS-MUM-2026-04-17-0042' }
      })
      setIsTyping(false)
      addMessage('assistant', data.response || "Task updated.")
    } catch (err) {
      setIsTyping(false)
      addMessage('assistant', "Network Error. Unable to process.")
    }
  }

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition isn't supported in your browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = async (event: any) => {
      setIsListening(false)
      const voiceText = event.results[0][0].transcript
      addMessage('user', '🎤 ' + voiceText)
      
      setIsTyping(true)
      try {
        const data = await fetchApi<{ response: string }>('/api/field-copilot/chat', {
          method: 'POST',
          body: { worker_id: 'WRK-MUM-015', message: voiceText, issue_id: 'ISS-MUM-2026-04-17-0042' }
        })
        setIsTyping(false)
        addMessage('assistant', data.response || "Voice processed.")
      } catch (err) {
        setIsTyping(false)
        addMessage('assistant', "Network Error. Unable to process.")
      }
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognition.start()
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Quick actions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-border">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => handleSend(action.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-elevated border border-border text-[10px] font-medium text-text-secondary hover:text-text-primary hover:border-agent-field-copilot/40 whitespace-nowrap transition-all"
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
              <div className={cn(
                'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-agent-commander text-white rounded-br-md'
                  : 'bg-surface-elevated text-text-primary rounded-bl-md border border-border'
              )}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <div className="flex gap-2 items-end">
            <div className="w-7 h-7 rounded-full bg-agent-field-copilot/10 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-agent-field-copilot" />
            </div>
            <div className="bg-surface-elevated rounded-2xl rounded-bl-md px-4 py-3 border border-border">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoice}
            className={cn(
              'p-2.5 rounded-xl transition-all',
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
            placeholder="Ask for help..."
            className="flex-1 bg-surface-elevated rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted border border-border focus:border-agent-field-copilot/50 outline-none transition-colors"
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
