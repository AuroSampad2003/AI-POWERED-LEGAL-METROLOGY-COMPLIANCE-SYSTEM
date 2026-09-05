const variants = {
  primary:
    'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-900 disabled:bg-ink-300',
  accent:
    'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-700 disabled:bg-accent-100 disabled:text-accent-500',
  secondary:
    'bg-white text-ink-700 border border-ink-200 hover:bg-ink-100 disabled:text-ink-400',
  ghost:
    'bg-transparent text-ink-600 hover:bg-ink-100 disabled:text-ink-300',
  danger:
    'bg-white text-status-fail border border-ink-200 hover:bg-status-fail-bg',
};

const sizes = {
  sm: 'text-sm px-3 py-1.5 rounded-md',
  md: 'text-sm px-4 py-2.5 rounded-lg',
  lg: 'text-[15px] px-5 py-3 rounded-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
};

export default Button;
