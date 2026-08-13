import React, { useState } from 'react';
import { User, Activity, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { profileApi } from '../../api/endpoints';

interface Props {
  isOpen: boolean;
  onSuccess: () => void;
}

export const BasicProfileModal: React.FC<Props> = ({ isOpen, onSuccess }) => {
  const { updateUserStatus, refreshProfile } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>(28);
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState<number | ''>(174);
  const [weight, setWeight] = useState<number | ''>(70);
  const [place, setPlace] = useState('Chennai');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const calculateBmi = () => {
    if (typeof height === 'number' && height > 0 && typeof weight === 'number' && weight > 0) {
      const hM = height / 100;
      return (weight / (hM * hM)).toFixed(1);
    }
    return '0.0';
  };

  const getBmiCategory = (bmiVal: number) => {
    if (bmiVal < 18.5) return { label: 'Underweight', color: 'text-amber-400' };
    if (bmiVal < 25) return { label: 'Normal Baseline', color: 'text-emerald-400' };
    if (bmiVal < 30) return { label: 'Overweight Indicator', color: 'text-amber-400' };
    return { label: 'Elevated Metabolic Load', color: 'text-rose-400' };
  };

  const currentBmi = parseFloat(calculateBmi());
  const bmiInfo = getBmiCategory(currentBmi);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !height || !weight || !place) {
      setError('Please fill in all profile fields.');
      return;
    }
    setError(null);
    setIsSaving(true);

    try {
      await profileApi.createProfile({
        name,
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        place
      });
      await refreshProfile();
      updateUserStatus({ hasProfile: true });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save health profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white mb-3 shadow-lg shadow-cyan-500/20">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t('profile.title')}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {t('profile.subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t('profile.name')}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('profile.age')}
              </label>
              <input
                type="number"
                required
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('profile.gender')}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
              >
                <option value="Male">{t('profile.male')}</option>
                <option value="Female">{t('profile.female')}</option>
                <option value="Other">{t('profile.other')}</option>
                <option value="Prefer not to say">{t('profile.prefer_not_to_say')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('profile.height')}
              </label>
              <input
                type="number"
                required
                step="0.1"
                min={50}
                max={280}
                value={height}
                onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                placeholder="175"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('profile.weight')}
              </label>
              <input
                type="number"
                required
                step="0.1"
                min={20}
                max={300}
                value={weight}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                placeholder="70"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          {/* Live BMI indicator Card */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-300">{t('profile.bmi_label')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-white">{currentBmi}</span>
              <span className={`text-[11px] font-medium ${bmiInfo.color}`}>
                ({bmiInfo.label})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t('profile.place')}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="e.g. Chennai, Bangalore, Mumbai"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 mt-2"
          >
            <span>{t('profile.save_profile')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
