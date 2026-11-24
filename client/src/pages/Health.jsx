import { useState } from 'react';
import { Droplets, Dumbbell, HeartPulse, Ruler, UtensilsCrossed } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';
import MealPlanner from '../components/health/MealPlanner.jsx';
import WaterTracker from '../components/health/WaterTracker.jsx';
import MeasurementsTracker from '../components/health/MeasurementsTracker.jsx';
import ExerciseTracker from '../components/health/ExerciseTracker.jsx';

const TABS = [
  { value: 'diet', label: 'Diet' },
  { value: 'water', label: 'Water' },
  { value: 'body', label: 'Body' },
  { value: 'exercise', label: 'Exercise' },
];

const Health = () => {
  const [tab, setTab] = useState('diet');

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Health & fitness"
        subtitle="Nourish, hydrate, measure and move — simple, honest tracking."
        actions={
          <SegmentedControl
            options={TABS.map((t) => ({
              ...t,
              label: (
                <span className="flex items-center gap-1.5">
                  {t.value === 'diet' && <UtensilsCrossed size={13} />}
                  {t.value === 'water' && <Droplets size={13} />}
                  {t.value === 'body' && <Ruler size={13} />}
                  {t.value === 'exercise' && <Dumbbell size={13} />}
                  {t.label}
                </span>
              ),
            }))}
            value={tab}
            onChange={setTab}
            className="flex-wrap"
          />
        }
      />

      <div className="mb-5 flex items-center gap-2 text-sm text-taupe-600">
        <HeartPulse size={16} className="text-terracotta-500" />
        <span>Small, consistent habits compound. This is your space to notice patterns.</span>
      </div>

      {tab === 'diet' && <MealPlanner />}
      {tab === 'water' && <WaterTracker />}
      {tab === 'body' && <MeasurementsTracker />}
      {tab === 'exercise' && <ExerciseTracker />}
    </div>
  );
};

export default Health;
