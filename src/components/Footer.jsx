import React, { useState } from 'react';
import { Youtube, Instagram, Linkedin, MessageSquare } from 'lucide-react';
import yiruiLogo from '../assets/yirui_logo.png';

const Footer = () => {
  const [copyStatus, setCopyStatus] = useState('harpist11');

  const handleCopyWeChat = async () => {
    try {
      await navigator.clipboard.writeText('harpist11');
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('harpist11'), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <footer className="bg-dark-900 pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center">
        <div 
          className="h-24 md:h-28 w-64 md:w-72 bg-gold mb-10 opacity-80 hover:opacity-100 transition-all duration-500"
          style={{ 
            WebkitMaskImage: `url(${yiruiLogo})`,
            maskImage: `url(${yiruiLogo})`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskSize: 'contain'
          }}
          aria-label="Dr. Yirui Li Logo"
        />
        
        <div className="flex flex-wrap justify-center items-center gap-6 mb-12">
          <a href="https://youtube.com/@harpist-li?si=3UvIHHgf0jfMZpKp" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 text-gray-400 hover:text-gold hover:border-gold transition-all duration-500 group" aria-label="YouTube">
            <Youtube className="w-5 h-5 stroke-[1.5] group-hover:scale-110 transition-transform duration-500" />
          </a>
          <a href="https://www.instagram.com/harpist.yr?igsh=ZjhqeDh1Mm54ZHZp" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 text-gray-400 hover:text-gold hover:border-gold transition-all duration-500 group" aria-label="Instagram">
            <Instagram className="w-5 h-5 stroke-[1.5] group-hover:scale-110 transition-transform duration-500" />
          </a>
          <a href="https://xhslink.com/m/A1JHHnLKI3C" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 text-gray-400 hover:text-gold hover:border-gold transition-all duration-500 group" aria-label="Xiaohongshu">
            {/* Simple Xiaohongshu icon approximation */}
            <div className="w-5 h-5 bg-current group-hover:scale-110 transition-transform duration-500" style={{WebkitMask: `url('https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/xiaohongshu.svg') center/contain no-repeat`, mask: `url('https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/xiaohongshu.svg') center/contain no-repeat`}}></div>
          </a>
          <a href="https://www.linkedin.com/in/yirui-li-14b83b200/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 text-gray-400 hover:text-gold hover:border-gold transition-all duration-500 group" aria-label="LinkedIn">
            <Linkedin className="w-5 h-5 stroke-[1.5] group-hover:scale-110 transition-transform duration-500" />
          </a>
        </div>
        
        <div className="w-full max-w-sm h-px bg-linear-to-r from-transparent via-white/10 to-transparent mb-10"></div>
        
        <div className="flex items-center space-x-3 mb-10 text-[11px] font-light text-gray-400 tracking-[0.2em] uppercase">
          <span>WeChat</span>
          <span className="w-1 h-1 rounded-full bg-gold/50"></span>
          <span 
            className="text-gold font-medium cursor-pointer transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(197,160,89,0.8)]" 
            title="Click to copy"
            onClick={handleCopyWeChat}
          >
            {copyStatus}
          </span>
        </div>
        
        <div className="text-[10px] font-light text-gray-600 tracking-[0.2em] uppercase">
          &copy; {new Date().getFullYear()} Dr. Yirui Li. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
