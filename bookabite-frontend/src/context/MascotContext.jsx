import { createContext, useContext, useState, useRef, useCallback } from 'react';

const MascotContext = createContext(null);

export function MascotProvider({ children }) {
  const [mood, setMood] = useState('idle'); // 'idle' | 'happy' | 'excited' | 'thinking' | 'celebrating' | 'serving'
  const [message, setMessage] = useState("Welcome to BookABite! May I help you reserve a table?");
  const [isOpen, setIsOpen] = useState(true);
  const timerRef = useRef(null);

  const triggerReaction = useCallback((newMood, newMessage = '', duration = 4000) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setMood(newMood);
    if (newMessage) setMessage(newMessage);

    if (newMood !== 'idle') {
      timerRef.current = setTimeout(() => {
        setMood('idle');
      }, duration);
    }
  }, []);

  const clearMessage = useCallback(() => {
    setMessage('');
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <MascotContext.Provider
      value={{
        mood,
        message,
        isOpen,
        triggerReaction,
        clearMessage,
        toggleOpen,
        setIsOpen,
      }}
    >
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const ctx = useContext(MascotContext);
  if (!ctx) {
    throw new Error('useMascot must be used within MascotProvider');
  }
  return ctx;
}
