export function BeforeYouGo() {
  return (
    <div className="w-full mt-8 border border-border-default bg-surface-grey rounded-[12px] p-6">
      <h3 className="type-subheading text-text-primary mb-4">Before You Go</h3>
      <ul className="space-y-4">
        <li className="flex items-start gap-3">
          <span className="text-xl leading-none" aria-hidden="true">🅿️</span>
          <span className="type-body text-sm text-text-secondary">Parking is limited after 7 PM.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-xl leading-none" aria-hidden="true">🚗</span>
          <span className="type-body text-sm text-text-secondary">Uber prices usually surge after 9 PM.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-xl leading-none" aria-hidden="true">👟</span>
          <span className="type-body text-sm text-text-secondary">Covered shoes recommended on weekends.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-xl leading-none" aria-hidden="true">🍽️</span>
          <span className="type-body text-sm text-text-secondary">Kitchen stops taking orders around 10:15 PM.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-xl leading-none" aria-hidden="true">📅</span>
          <span className="type-body text-sm text-text-secondary">Reservations advised Friday evenings.</span>
        </li>
      </ul>
    </div>
  );
}
