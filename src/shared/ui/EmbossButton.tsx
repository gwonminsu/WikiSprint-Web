import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function EmbossButton({
  children,
  variant = 'primary',
  fullWidth = false,
  className,
  ...props
}: Props): React.ReactElement {

  const baseStyle = `
    relative overflow-hidden
    inline-flex items-center justify-center
    py-3 rounded-2xl font-medium
    transition-all duration-200 ease-out
    backdrop-blur-sm
    active:scale-[0.97]
  `;

  const variants: Record<Variant, string> = {
    primary: `
      bg-amber-400/90
      text-black
      shadow-md shadow-amber-400/20
      hover:bg-amber-400
      hover:shadow-lg hover:shadow-amber-400/30
      hover:-translate-y-[1px]
      active:shadow-sm
    `,
    secondary: `
      bg-white/70 dark:bg-gray-700/60
      text-gray-900 dark:text-white
      border border-gray-200 dark:border-gray-600
      shadow-sm
      hover:bg-white dark:hover:bg-gray-700
      hover:-translate-y-[1px]
    `,
    danger: `
      bg-gradient-to-br from-red-400 to-red-500
      text-white
      shadow-md shadow-red-500/30
      hover:shadow-lg hover:shadow-red-500/40
      hover:-translate-y-[1px]
    `,
  };

  return (
    <button
      {...props}
      className={`
        ${baseStyle}
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className ?? ''}
      `}
    >
      {children}
    </button>
  );
}