import React from 'react';
import { DailyHealthForm } from '../components/daily/DailyHealthForm';

interface Props {
  onSaved: () => void;
}

export const DailyLoggingPage: React.FC<Props> = ({ onSaved }) => {
  return (
    <div className="w-full py-4 space-y-6">
      <DailyHealthForm onSuccess={onSaved} />
    </div>
  );
};
