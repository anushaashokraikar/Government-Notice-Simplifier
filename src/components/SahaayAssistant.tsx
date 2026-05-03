import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Mic, Volume2, Square, Loader2, ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { chatWithSahaay } from '@/lib/gemini';
import { toast } from 'sonner';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function SahaayAssistant({ context }: { context?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Message[]>([
    { role: 'model', text: 'Namaste! I am Sahaay. How can I assist you with government services today?' }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Speech Recognition Setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }

  const startListening = () => {
    if (!recognition) {
      toast.error("Speech recognition is not supported.");
      return;
    }
    setIsListening(true);
    recognition.start();
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    const userMessage = message;
    setMessage('');
    setHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsSending(true);

    try {
      const response = await chatWithSahaay(userMessage, history, context);
      setHistory(prev => [...prev, { role: 'model', text: response }]);
      // Auto-speak if the user used voice or if it's a short response? 
      // For now, let's just make it available.
    } catch (error) {
      toast.error("Sahaay is currently unavailable.");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
        const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [history]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-[95vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
            >
              <header className="p-6 bg-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg leading-none">Sahaay</h3>
                    <p className="text-[10px] text-indigo-200 mt-1 uppercase font-bold tracking-widest">Digital Assistant</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  className="rounded-full hover:bg-white/10 text-white"
                >
                  <ChevronDown className="w-6 h-6" />
                </Button>
              </header>

              <ScrollArea ref={scrollRef} className="flex-1 p-6">
                <div className="space-y-6">
                  {history.map((chat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: chat.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "flex flex-col gap-2",
                        chat.role === 'user' ? "items-end" : "items-start"
                      )}
                    >
                      <div className={cn(
                        "p-4 rounded-[1.5rem] text-sm leading-relaxed max-w-[85%] relative group",
                        chat.role === 'user' 
                          ? "bg-indigo-600 text-white rounded-tr-none" 
                          : "bg-slate-100 text-slate-800 rounded-tl-none"
                      )}>
                        {chat.text}
                        {chat.role === 'model' && (
                          <button 
                            onClick={() => speak(chat.text)}
                            className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 p-4 rounded-2xl">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <footer className="p-6 border-t bg-slate-50/50">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <Input 
                      placeholder="Ask me anything..."
                      className="h-14 rounded-2xl pr-12 pl-4 border-none shadow-inner bg-white font-medium"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={isListening ? () => {} : startListening}
                      className={cn(
                        "absolute right-2 top-2 h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                        isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-400 hover:text-indigo-600"
                      )}
                    >
                      {isListening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button 
                    type="submit"
                    disabled={!message.trim() || isSending}
                    className="h-14 w-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-slate-900 border-4 border-white shadow-2xl flex items-center justify-center text-white relative group transition-all"
          >
            {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8 group-hover:scale-110 transition-transform" />}
            {!isOpen && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full animate-ping" />
            )}
            <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-xl shadow-xl border text-slate-900 font-black text-[10px] tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase">
              SAHAAY ASSISTANT
            </div>
          </Button>
        </motion.div>
      </div>
    </>
  );
}
