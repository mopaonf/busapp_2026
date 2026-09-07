function StatCard({ label, value, note, tone = 'default' }) {
   const toneClasses = {
      default: 'border-[var(--color-border)]',
      success: 'border-[var(--color-success)]/30',
      warning: 'border-[var(--color-warning)]/30',
      info: 'border-[var(--color-info)]/30',
   };

   return (
      <article
         className={`rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] ${toneClasses[tone]}`}
      >
         <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            {label}
         </p>
         <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            {value}
         </p>
         <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {note}
         </p>
      </article>
   );
}

export default StatCard;
