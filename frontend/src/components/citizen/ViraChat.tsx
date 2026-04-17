import { useState, useRef } from 'react'
import { Send, Mic, MicOff, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

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

  const addMessage = (role: 'user' | 'assistant', text: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      role,
      text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, msg])
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100)
  }

  const handleSend = () => {
    if (!input.trim()) return
    addMessage('user', input.trim())
    setInput('')

    // Simulate VIRA response
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      addMessage('assistant', "Got it! I've noted your concern. Let me check on that for you. Is there anything specific about the location you'd like to add?")
    }, 1500)
  }

  const toggleVoice = () => {
    setIsListening(!isListening)
    if (!isListening) {
      // Simulate voice recording
      setTimeout(() => {
        setIsListening(false)
        setInput('There is a burst water pipe near Gate 2')
      }, 3000)
    }
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
