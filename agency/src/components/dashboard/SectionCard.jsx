function SectionCard({ title, description, action, children, className = '' }) {
   return (
      <section
         className={`rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] ${className}`}
      >
         <div className="mb-5 flex items-start justify-between gap-4">
            <div>
               <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {title}
               </h2>
               {description ? (
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                     {description}
                  </p>
               ) : null}
            </div>

            {action}
         </div>

         {children}
      </section>
   );
}

export default SectionCard;
