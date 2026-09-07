import { useMemo, useState } from 'react';
import { FaBus, FaDoorOpen } from 'react-icons/fa6';

function SeatMapPreview({
   busType,
   totalSeats,
   seatsPerRow,
   layoutSections,
   isDoubleDecker,
   selectedSeat,
   onSeatSelect,
}) {
   const [activeDeck, setActiveDeck] = useState('lower');
   const deckRanges = useMemo(() => {
      if (!isDoubleDecker) {
         return {
            lower: { start: 1, end: totalSeats, count: totalSeats },
            upper: { start: 0, end: 0, count: 0 },
         };
      }

      const lowerFrontSeats = Math.min(2, totalSeats);
      const remainingSeats = Math.max(0, totalSeats - lowerFrontSeats);
      const lowerStandardSeats = Math.ceil(remainingSeats / 2);
      const upperCount = remainingSeats - lowerStandardSeats;
      const lowerCount = lowerFrontSeats + lowerStandardSeats;

      return {
         lower: { start: 1, end: lowerCount, count: lowerCount },
         upper: {
            start: lowerCount + 1,
            end: totalSeats,
            count: upperCount,
         },
      };
   }, [isDoubleDecker, totalSeats]);

   const currentDeckRange =
      activeDeck === 'upper' && isDoubleDecker
         ? deckRanges.upper
         : deckRanges.lower;
   const currentDeckSeatCount = currentDeckRange.count;
   const shouldShowFrontModule = !isDoubleDecker || activeDeck === 'lower';
   const frontSeatCount = shouldShowFrontModule
      ? Math.min(2, currentDeckSeatCount)
      : 0;
   const frontSeatNumbers = Array.from(
      { length: frontSeatCount },
      (_, index) => currentDeckRange.start + index,
   );
   const standardSeatCount = Math.max(0, currentDeckSeatCount - frontSeatCount);
   const standardSeatStart = currentDeckRange.start + frontSeatCount;
   const rows = Math.ceil(standardSeatCount / seatsPerRow);
   const seatNumbers = Array.from(
      { length: standardSeatCount },
      (_, index) => standardSeatStart + index,
   );

   const seatShape = `${layoutSections.join(' + ')} layout`;
   const isBalancedCabin =
      layoutSections.length === 2 && layoutSections[0] === layoutSections[1];
   const dynamicLayoutTitle = `${layoutSections.join(' + ')} ${isBalancedCabin ? 'balanced cabin' : 'custom cabin'}`;
   const dynamicLayoutDescription = `${layoutSections.length - 1} aisle${layoutSections.length - 1 === 1 ? '' : 's'}, ${seatsPerRow} seats per standard row`;

   return (
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
         <div className="mb-4 flex items-start justify-between gap-3">
            <div>
               <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                  Seat preview
               </p>
               <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                  {isDoubleDecker
                     ? `${activeDeck === 'upper' ? 'Top' : 'Lower'} deck display`
                     : 'Classic bus display'}
               </h2>
               <p className="mt-1 max-w-xl text-xs text-[var(--color-text-secondary)]">
                  Select a seat to preview how the cabin will look inside the
                  bus. The selected seat is highlighted and the preview follows
                  the current bus type.
               </p>
            </div>

            <div className="rounded-[var(--radius-md)] bg-[var(--color-background)] px-3 py-2 text-right">
               <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                  Layout
               </p>
               <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                  {seatShape}
               </p>
            </div>
         </div>

         {isDoubleDecker ? (
            <div className="mb-3 inline-flex rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] p-1 text-xs font-semibold">
               <button
                  type="button"
                  onClick={() => setActiveDeck('lower')}
                  className={`rounded-[calc(var(--radius-md)-4px)] px-3 py-1.5 transition ${activeDeck === 'lower' ? 'bg-[var(--color-primary)] text-[var(--color-text-light)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
               >
                  Lower deck ({deckRanges.lower.count})
               </button>
               <button
                  type="button"
                  onClick={() => setActiveDeck('upper')}
                  className={`rounded-[calc(var(--radius-md)-4px)] px-3 py-1.5 transition ${activeDeck === 'upper' ? 'bg-[var(--color-primary)] text-[var(--color-text-light)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
               >
                  Top deck ({deckRanges.upper.count})
               </button>
            </div>
         ) : null}

         <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] p-3">
               <div className="mb-3 flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-surface)] px-3 py-2 shadow-[var(--shadow-sm)]">
                  <div className="flex items-center gap-3">
                     <div className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-text-light)] shadow-[var(--shadow-md)]">
                        <FaBus />
                     </div>
                     <div>
                        <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                           {shouldShowFrontModule
                              ? 'Front cabin'
                              : 'Top deck front'}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-secondary)]">
                           {shouldShowFrontModule
                              ? 'Driver and entrance are at the top of the layout'
                              : 'Top deck follows the exact seat layout pattern'}
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--color-text-secondary)]">
                     {shouldShowFrontModule ? (
                        <>
                           <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-background)] px-2 py-1">
                              Driver
                           </span>
                           <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-background)] px-2 py-1">
                              <FaDoorOpen /> Entry
                           </span>
                        </>
                     ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-background)] px-2 py-1">
                           Pattern only
                        </span>
                     )}
                  </div>
               </div>

               {shouldShowFrontModule ? (
                  <div className="mb-2.5 grid grid-cols-[minmax(0,1fr)_12px_repeat(2,minmax(0,1fr))] items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-2 shadow-[var(--shadow-sm)]">
                     <div className="flex h-8 items-center justify-center rounded-[10px] border border-dashed border-[var(--color-border)] bg-[var(--color-background)] text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                        Driver
                     </div>
                     <div className="mx-auto h-full w-px bg-[var(--color-border)]" />
                     {Array.from({ length: 2 }, (_, index) => {
                        const seatNumber = frontSeatNumbers[index];

                        return seatNumber ? (
                           <SeatButton
                              key={`front-${seatNumber}`}
                              seatNumber={seatNumber}
                              selectedSeat={selectedSeat}
                              onSeatSelect={onSeatSelect}
                           />
                        ) : (
                           <div key={`front-empty-${index}`} className="h-8" />
                        );
                     })}
                  </div>
               ) : null}

               <div className="space-y-1.5">
                  {Array.from({ length: rows }, (_, rowIndex) => {
                     const start = rowIndex * seatsPerRow;
                     const rowSeats = seatNumbers.slice(
                        start,
                        start + seatsPerRow,
                     );
                     let cursor = 0;
                     const sectionSeatGroups = layoutSections.map(
                        (sectionSize) => {
                           const section = rowSeats.slice(
                              cursor,
                              cursor + sectionSize,
                           );
                           cursor += sectionSize;
                           return section;
                        },
                     );
                     const gridTemplateColumns = layoutSections
                        .map(
                           (sectionSize) =>
                              `repeat(${sectionSize}, minmax(0, 1fr))`,
                        )
                        .join(' 12px ');

                     return (
                        <div
                           key={`${busType.label}-${rowIndex}`}
                           className="grid items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-2 shadow-[var(--shadow-sm)]"
                           style={{
                              gridTemplateColumns,
                           }}
                        >
                           {sectionSeatGroups.map((section, sectionIndex) => (
                              <div
                                 key={`${rowIndex}-${sectionIndex}`}
                                 className="contents"
                              >
                                 {Array.from(
                                    { length: layoutSections[sectionIndex] },
                                    (_, sectionSeatIndex) => {
                                       const seatNumber =
                                          section[sectionSeatIndex];

                                       return seatNumber ? (
                                          <SeatButton
                                             key={seatNumber}
                                             seatNumber={seatNumber}
                                             selectedSeat={selectedSeat}
                                             onSeatSelect={onSeatSelect}
                                          />
                                       ) : (
                                          <div
                                             key={`empty-${rowIndex}-${sectionIndex}-${sectionSeatIndex}`}
                                             className="h-8"
                                          />
                                       );
                                    },
                                 )}
                                 {sectionIndex <
                                 sectionSeatGroups.length - 1 ? (
                                    <div className="mx-auto h-full w-px bg-[var(--color-border)]" />
                                 ) : null}
                              </div>
                           ))}
                        </div>
                     );
                  })}
               </div>
            </div>

            <div className="space-y-4">
               <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                     Selected seat
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                     {selectedSeat}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                     Seats {currentDeckRange.start} to {currentDeckRange.end}
                  </p>
               </div>

               <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                     Layout details
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--color-text-primary)]">
                     {dynamicLayoutTitle}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                     {dynamicLayoutDescription}
                  </p>
                  <p className="mt-2 text-xs font-medium text-[var(--color-text-secondary)]">
                     Pattern: {layoutSections.join('-')} | Seats: {totalSeats} |
                     Deck: {isDoubleDecker ? activeDeck : 'single'}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                     Base bus type: {busType.layout}
                  </p>
               </div>

               <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                     Seat legend
                  </p>

                  <div className="mt-3 space-y-2 text-sm text-[var(--color-text-secondary)]">
                     <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-[var(--color-primary)]" />
                        Selected seat
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]" />
                        Available seat
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-[var(--color-disabled)]" />
                        Reserved placeholder
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
}

function SeatButton({ seatNumber, selectedSeat, onSeatSelect }) {
   const isSelected = seatNumber === selectedSeat;

   return (
      <button
         type="button"
         onClick={() => onSeatSelect(seatNumber)}
         className={`flex h-8 items-center justify-center rounded-[10px] border text-[11px] font-semibold transition duration-300 ease-in-out ${isSelected ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-light)] shadow-[var(--shadow-md)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'}`}
         aria-pressed={isSelected}
         aria-label={`Seat ${seatNumber}`}
      >
         {seatNumber}
      </button>
   );
}

export default SeatMapPreview;
