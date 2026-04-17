import { useState, useRef } from 'react'
import { Send, Mic, MicOff, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { useApi } from '../../hooks/useApi'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
}

interface ViraChatProps {
  className?: string
}

export default function ViraChat({ className }: ViraChatProps) {
  const { fetchApi } = useApi();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      text: "Hi! I'm VIRA, your AI assistant. You can describe an issue, ask about your complaints, or report a problem using voice. How can I help?",
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
    const msg: Message = {
      id: Date.now().toString(),
      role,
      text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, msg])
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100)
    
    if (role === 'assistant') {
      speak(text)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userText = input.trim()
    addMessage('user', userText)
    setInput('')

    setIsTyping(true)
    try {
      const data = await fetchApi<{ response: string }>('/api/vira/chat', {
        method: 'POST',
        body: { user_id: 'CITIZEN-MUM-01', message: userText }
      })
      setIsTyping(false)
      addMessage('assistant', data.response || "I didn't quite get that.")
    } catch (err) {
      setIsTyping(false)
      addMessage('assistant', "Sorry, I'm having trouble connecting to the network right now.")
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
        const data = await fetchApi<{ response: string }>('/api/vira/chat', {
          method: 'POST',
          body: { user_id: 'CITIZEN-MUM-01', message: voiceText }
        })
        setIsTyping(false)
        addMessage('assistant', data.response || "Voice processed.")
      } catch (err) {
        setIsTyping(false)
        addMessage('assistant', "Error processing voice.")
      }
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognition.start()
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex gap-2',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-agent-vira/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={14} className="text-agent-vira" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-surface-elevated text-text-primary rounded-bl-md border border-border'
                )}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex gap-2 items-end">
            <div className="w-7 h-7 rounded-full bg-agent-vira/10 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-agent-vira" />
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
              isListening
                ? 'bg-critical/20 text-critical animate-pulse'
                : 'bg-surface-elevated text-text-muted hover:text-text-secondary'
            )}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? 'Listening...' : 'Type a message...'}
            className="flex-1 bg-surface-elevated rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted border border-border focus:border-primary/50 outline-none transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-primary text-white disabled:opacity-30 transition-opacity hover:bg-primary-dark"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
