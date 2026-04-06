import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-text/40 backdrop-blur-sm z-[100]"
            aria-hidden="true"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface w-full max-w-md rounded-3xl shadow-2xl p-8 pointer-events-auto border border-border"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              aria-describedby="modal-message"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-2xl ${type === 'danger' ? 'bg-expense/10' : 'bg-accent/10'}`}>
                  {type === 'danger' ? (
                    <AlertTriangle className="w-6 h-6 text-expense" aria-hidden="true" />
                  ) : (
                    <X className="w-6 h-6 text-accent" aria-hidden="true" />
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-bg rounded-xl transition-all text-muted hover:text-text outline-none focus:ring-2 focus:ring-border"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <h3 id="modal-title" className="text-xl font-bold text-text uppercase tracking-tight mb-2">
                {title}
              </h3>
              <p id="modal-message" className="text-sm text-muted font-medium leading-relaxed mb-8">
                {message}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 bg-bg text-text font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-border transition-all outline-none focus:ring-2 focus:ring-border"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-4 text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all outline-none focus:ring-2 ${
                    type === 'danger' 
                      ? 'bg-expense shadow-expense/20 hover:bg-expense/90 focus:ring-expense/20' 
                      : 'bg-accent shadow-accent/20 hover:bg-accent/90 focus:ring-accent/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
