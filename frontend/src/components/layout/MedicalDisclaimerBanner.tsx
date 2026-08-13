import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const MedicalDisclaimerBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-slate-900/90 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200/90 flex items-center justify-center space-x-2 backdrop-blur-md z-40">
      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
      <span className="text-center font-medium">
        <strong className="text-amber-400 font-semibold mr-1">Medical Disclaimer:</strong>
        {t('app.medical_disclaimer')}
      </span>
    </div>
  );
};
