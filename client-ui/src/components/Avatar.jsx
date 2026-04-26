import React from 'react';
import BoringAvatar from 'boring-avatars';

/**
 * Reusable Avatar Component using boring-avatars
 * Generates unique avatars based on user name/seed
 * 
 * @param {string} name - User's name (used as seed for avatar)
 * @param {number} size - Avatar size in pixels (default: 40)
 * @param {string} className - Additional CSS classes
 * @param {string} variant - Avatar variant style (default: beam)
 */
export default function Avatar({ name = 'User', size = 40, className = '', variant = 'beam' }) {
  return (
    <BoringAvatar
      size={size}
      name={name}
      variant={variant}
      colors={['#f99c00', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']}
      className={`rounded-lg object-cover border border-white/10 hover:border-[#f99c00]/30 transition-all ${className}`}
    />
  );
}
