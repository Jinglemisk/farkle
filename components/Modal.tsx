
import React from 'react';

interface ModalProps {
  title: string;
  message: string;
  onClose: () => void;
  buttonText: string;
}

const Modal: React.FC<ModalProps> = ({ title, message, onClose, buttonText }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-stone-800 border-4 border-amber-700 rounded-xl p-6 sm:p-7 text-center shadow-2xl max-w-sm sm:max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-amber-300 mb-3 sm:mb-4">{title}</h2>
        <p className="text-amber-100 text-base sm:text-lg mb-5">{message}</p>
        <button
          onClick={onClose}
          className="bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold py-2.5 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Modal;
