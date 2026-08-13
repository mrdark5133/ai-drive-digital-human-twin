import React, { useState, useEffect } from 'react';
import { User, Activity, MapPin, Save, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { profileApi } from '../api/endpoints';

export const ProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState<number | ''>(profile?.age || 28);
  const [gender, setGender] = useState(profile?.gender || 'Male');
  const [height, setHeight] = useState<number | ''>(profile?.height || 175);
  const [weight, setWeight] = useState<number | ''>(profile?.weight || 72);
  const [place, setPlace] = useState(profile?.place || 'Chennai');

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAge(profile.age);
      setGender(profile.gender);
      setHeight(profile.height);
      setWeight(profile.weight);
      setPlace(profile.place);
    }
  }, [profile]);

  const calculateBmi = () => {
    if (typeof height === 'number' && height > 0 && typeof weight === 'number' && weight > 0) {
      const hM = height / 100;
      return (weight / (hM * hM)).toFixed(1);
    }
    return '0.0';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await profileApi.updateProfile({
        name,
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        place
      });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
            <p className="text-xs text-slate-400">Manage your physiological baseline and permanent personal details.</p>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Profile parameters updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl glass-panel space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">{t('profile.name')}</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">{t('profile.age')}</label>
            <input
              type="number"
              required
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">{t('profile.gender')}</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="Male">{t('profile.male')}</option>
              <option value="Female">{t('profile.female')}</option>
              <option value="Other">{t('profile.other')}</option>
              <option value="Prefer not to say">{t('profile.prefer_not_to_say')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">{t('profile.height')}</label>
            <input
              type="number"
              required
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">{t('profile.weight')}</label>
            <input
              type="number"
              required
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {/* BMI Box */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">Current Computed Body Mass Index</span>
          <span className="font-mono text-sm font-bold text-cyan-300">{calculateBmi()} BMI</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">{t('profile.place')}</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition flex items-center space-x-2 shadow-md shadow-cyan-500/20"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? t('common.loading') : t('profile.update_profile')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
