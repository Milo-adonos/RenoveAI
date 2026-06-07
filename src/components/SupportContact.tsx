export function SupportContact() {
  return (
    <a
      href="mailto:renoveia.support@gmail.com"
      className="flex items-center gap-4 bg-support rounded-2xl p-4 w-[90%] mx-auto hover:opacity-90 transition-opacity"
    >
      <span className="text-2xl flex-shrink-0" aria-hidden="true">
        ✉️
      </span>
      <div className="text-left min-w-0">
        <p className="text-xs text-muted uppercase tracking-widest leading-snug">
          Une question ? Un souci ?
        </p>
        <p className="text-accent font-bold text-sm sm:text-base break-all">
          renoveia.support@gmail.com
        </p>
      </div>
    </a>
  );
}
