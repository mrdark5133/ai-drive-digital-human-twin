import React, { useState } from 'react';
import { Globe, Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { settingsApi } from '../../api/endpoints';
import { SupportedLanguage } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const LanguageSelectorModal: React.FC<Props> = ({ isOpen, onClose, onComplete }) => {
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, updateUserStatus } = useAuth();
  const [selected, setSelected] = useState<SupportedLanguage>(language);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const languagesList: {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
    description: string;
  }[] = [
    { code: 'en', name: 'English', nativeName: 'English', description: 'Universal Clinical & AI Terminology' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', description: 'தமிழ் மொழிபெயர்ப்பு & AI பரிந்துரைகள்' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', description: 'हिन्दी इंटरफेस एवं स्वास्थ्य अंतर्दृष्टि' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', description: 'తెలుగు అనువాదం & విశ్లేషణ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', description: 'മലയാളം ഇന്റർഫേസും ശുപാർശകളും' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', description: 'ಕನ್ನಡ ಭಾಷೆ ಮತ್ತು ಆರೋಗ್ಯ ಸಲಹೆಗಳು' },
  ];

  const handleConfirm = async () => {
    setIsSaving(true);
    setLanguage(selected);
    if (isAuthenticated) {
      try {
        await settingsApi.updateLanguage(selected);
        updateUserStatus({ language: selected });
      } catch (e) {
        console.error('Could not save language to backend', e);
      }
    }
    setIsSaving(false);
    onClose();
    if (onComplete) onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-950 border border-cyan-500/30 text-cyan-400 mb-3">
            <Globe className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t('language.select_title')}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {t('language.select_subtitle')}
          </p>
        </div>

        {/* 6 Language Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {languagesList.map((item) => {
            const isCurrent = selected === item.code;
            return (
              <div
                key={item.code}
                onClick={() => setSelected(item.code)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">{item.nativeName}</span>
                    <span className="text-xs text-slate-400">({item.name})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                    isCurrent
                      ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                      : 'border-slate-600 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          disabled={isSaving}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2"
        >
          <span>{t('language.confirm')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
