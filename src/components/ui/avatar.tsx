"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl'
};

// 根據字符生成穩定的顏色
const getAvatarColor = (text: string): string => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600', 
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-cyan-500 to-cyan-600',
    'from-teal-500 to-teal-600',
    'from-orange-500 to-orange-600',
    'from-red-500 to-red-600',
    'from-amber-500 to-amber-600'
  ];
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// 獲取顯示字母
const getDisplayLetter = (name?: string, alt?: string): string => {
  const text = name || alt || '?';
  
  // 如果是中文，取第一個字
  if (/[\u4e00-\u9fff]/.test(text)) {
    return text.charAt(0);
  }
  
  // 如果是英文，取第一個字母並轉大寫
  const firstChar = text.charAt(0).toUpperCase();
  return /[A-Z]/.test(firstChar) ? firstChar : '?';
};

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  className 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const displayName = name || alt || '';
  const displayLetter = getDisplayLetter(displayName, alt);
  const bgGradient = getAvatarColor(displayName);
  
  const showImage = src && !imageError && imageLoaded;
  const showFallback = !src || imageError || !imageLoaded;

  return (
    <div className={cn(
      'relative rounded-full flex-shrink-0 overflow-hidden',
      sizeClasses[size],
      className
    )}>
      {/* 背景 fallback - 總是顯示 */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br flex items-center justify-center text-white font-semibold',
        bgGradient
      )}>
        {displayLetter}
      </div>
      
      {/* 圖片 - 如果存在且未出錯 */}
      {src && (
        <img
          src={src}
          alt={alt || displayName}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-200',
            showImage ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
        />
      )}
    </div>
  );
};

export default Avatar;