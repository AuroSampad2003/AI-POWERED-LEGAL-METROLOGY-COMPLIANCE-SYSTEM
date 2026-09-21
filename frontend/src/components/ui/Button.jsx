const variants = {
  primary:
    'bg-accent-600 text-white shadow-sm shadow-accent-900/10 hover:-translate-y-0.5 hover:bg-accent-700 hover:shadow-md hover:shadow-accent-900/15 active:translate-y-0 active:bg-accent-700 disabled:bg-accent-100 disabled:text-accent-500',
  accent:
    'bg-accent-600 text-white shadow-sm shadow-accent-900/10 hover:-translate-y-0.5 hover:bg-accent-700 hover:shadow-md hover:shadow-accent-900/15 active:translate-y-0 active:bg-accent-700 disabled:bg-accent-100 disabled:text-accent-500',
  secondary:
    'border border-ink-200 bg-white text-ink-700 shadow-sm hover:-translate-y-0.5 hover:border-accent-200 hover:bg-accent-50 disabled:text-ink-400',
  ghost:
    'bg-transparent text-ink-600 hover:bg-ink-100 hover:text-accent-700 disabled:text-ink-300',
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
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
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
