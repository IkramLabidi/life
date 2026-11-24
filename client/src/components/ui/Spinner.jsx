import { Loader2 } from 'lucide-react';

const Spinner = ({ label, className = '' }) => (
  <div className={`flex flex-col items-center gap-2 text-taupe-500 ${className}`}>
    <Loader2 className="animate-spin" size={26} />
    {label && <span className="text-sm">{label}</span>}
  </div>
);

export const SectionLoader = ({ className = '' }) => (
  <div className={`flex items-center justify-center py-10 ${className}`}>
    <Spinner />
  </div>
);

export default Spinner;
