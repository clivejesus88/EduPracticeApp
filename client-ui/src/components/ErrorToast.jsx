import React from 'react';
import { Icon } from '@iconify/react';

export default function ErrorToast({ message, onClose }) {
  return (
    <div className="fixed top-4 right-4 z-[1000] max-w-sm">
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <Icon icon="solar:danger-circle-bold" width="20" className="text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-300 font-medium">Error</p>
            <p className="text-xs text-red-400 mt-1">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <Icon icon="solar:close-circle-bold" width="16" />
          </button>
        </div>
      </div>
    </div>
  );
}