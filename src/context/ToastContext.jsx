import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-24 right-6 z-[9999] flex flex-col space-y-4 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastItem = ({ message, type, duration, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[#4ade80]" />,
    error: <AlertCircle className="w-5 h-5 text-[#f87171]" />,
    info: <Info className="w-5 h-5 text-gold" />,
  };

  const bgStyles = {
    success: 'border-[#4ade80]/20 bg-[#0a1a12]/95',
    error: 'border-[#f87171]/20 bg-[#1a0a0a]/95',
    info: 'border-gold/20 bg-[#1a160a]/95',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center space-x-4 px-5 py-4 min-w-[320px] max-w-md rounded-sm border shadow-2xl backdrop-blur-md transition-all duration-300 transform ${
        isExiting ? 'opacity-0 translate-x-12' : 'animate-fadeInRight'
      } ${bgStyles[type] || bgStyles.info}`}
    >
      <div className="flex-shrink-0">{icons[type] || icons.info}</div>
      <p className="flex-1 text-xs uppercase tracking-widest text-white font-medium leading-relaxed">
        {message}
      </p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="flex-shrink-0 text-white/30 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
