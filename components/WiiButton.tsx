import React from 'react';

interface WiiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
}

export const WiiButton: React.FC<WiiButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  className = '',
  ...props 
}) => {
  const baseStyles = "relative font-display font-bold rounded-full transition-all duration-200 flex items-center justify-center shadow-wii-button active:shadow-wii-pressed active:scale-95 border-2 border-white/50 overflow-hidden";
  
  const variants = {
    primary: "bg-wii-blue text-white hover:bg-sky-400",
    secondary: "bg-white text-wii-text hover:bg-gray-50",
    danger: "bg-wii-danger text-white hover:bg-red-400",
    success: "bg-wii-accent text-white hover:bg-teal-400",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-12 py-8 text-2xl w-full h-48 flex-col gap-4",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {/* Glossy Effect */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
      
      {icon && <span className={size === 'xl' ? 'scale-150' : 'mr-2'}>{icon}</span>}
      <span className="z-10 relative">{children}</span>
    </button>
  );
};