import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title = 'Nothing here yet', description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-sand-300 bg-cream-50/60 px-6 py-12 text-center">
    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sand-100 text-taupe-500">
      <Icon size={22} />
    </span>
    <div>
      <p className="font-display text-base font-semibold text-espresso-800">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-taupe-600">{description}</p>}
    </div>
    {action}
  </div>
);

export default EmptyState;
