const SidebarSection = ({ title, children, iconOnly }) => (
  <div className="mb-1">
    {!iconOnly && title && (
      <p className="px-3 mb-1.5 mt-5 first:mt-2 text-[11px] font-semibold tracking-wider text-ink-400 uppercase">
        {title}
      </p>
    )}
    {iconOnly && <div className="mt-3 mb-3 border-t border-ink-100 mx-3 first:mt-1" />}
    <nav className="space-y-0.5 px-2">{children}</nav>
  </div>
);

export default SidebarSection;
