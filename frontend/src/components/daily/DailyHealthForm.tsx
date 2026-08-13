import React, { useState, useEffect } from 'react';
import {
  Moon,
  Dumbbell,
  Footprints,
  Cigarette,
  Wine,
  Utensils,
  Save,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';
import { useDigitalTwin } from '../../context/DigitalTwinContext';
import { healthApi } from '../../api/endpoints';
import { MealItem } from '../../types';

interface Props {
  onSuccess?: () => void;
  dayNumber?: number;
}

export const DailyHealthForm: React.FC<Props> = ({ onSuccess, dayNumber }) => {
  const { t } = useLanguage();
  const { twinState, refreshAll } = useDigitalTwin();

  const currentDay = dayNumber || (twinState?.days_tracked ? twinState.days_tracked + 1 : 1);

  // Sleep
  const [sleepTime, setSleepTime] = useState('11:30 PM');
  const [wakeTime, setWakeTime] = useState('06:30 AM');
  const [sleepDuration, setSleepDuration] = useState<number>(7.0);

  // Exercise
  const [didExercise, setDidExercise] = useState<boolean>(true);
  const [exerciseType, setExerciseType] = useState('Brisk Walking & Core');
  const [exerciseDuration, setExerciseDuration] = useState<number>(35);

  // Walking
  const [didWalk, setDidWalk] = useState<boolean>(true);
  const [walkingDuration, setWalkingDuration] = useState<number>(30);
  const [steps, setSteps] = useState<number>(6500);

  // Habits
  const [didSmoke, setDidSmoke] = useState<boolean>(false);
  const [smokingFreq, setSmokingFreq] = useState<number>(0);

  const [didAlcohol, setDidAlcohol] = useState<boolean>(false);
  const [alcoholFreq, setAlcoholFreq] = useState<number>(0);

  // Meals
  const [breakfastFood, setBreakfastFood] = useState('2 Idli, sambar and coconut chutney');
  const [breakfastTime, setBreakfastTime] = useState('08:30 AM');

  const [lunchFood, setLunchFood] = useState('Brown rice, vegetables, dal and curd');
  const [lunchTime, setLunchTime] = useState('01:15 PM');

  const [snackFood, setSnackFood] = useState('Green tea and mixed nuts');
  const [snackTime, setSnackTime] = useState('05:00 PM');

  const [dinnerFood, setDinnerFood] = useState('2 Multigrain rotis with paneer sabzi');
  const [dinnerTime, setDinnerTime] = useState('08:45 PM');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate sleep duration automatically
  useEffect(() => {
    const parseTime = (timeStr: string) => {
      try {
        const parts = timeStr.trim().toUpperCase().split(' ');
        if (parts.length === 2) {
          const [hStr, mStr] = parts[0].split(':');
          let h = parseInt(hStr, 10);
          const m = parseInt(mStr, 10);
          if (parts[1] === 'PM' && h !== 12) h += 12;
          if (parts[1] === 'AM' && h === 12) h = 0;
          return h * 60 + m;
        }
      } catch (e) {
        return null;
      }
      return null;
    };

    const t1 = parseTime(sleepTime);
    const t2 = parseTime(wakeTime);
    if (t1 !== null && t2 !== null) {
      const diffMins = t2 >= t1 ? t2 - t1 : (1440 - t1) + t2;
      setSleepDuration(parseFloat((diffMins / 60).toFixed(1)));
    }
  }, [sleepTime, wakeTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    const meals: MealItem[] = [
      { meal_type: 'breakfast', food_description: breakfastFood, meal_time: breakfastTime },
      { meal_type: 'lunch', food_description: lunchFood, meal_time: lunchTime },
      { meal_type: 'snack', food_description: snackFood, meal_time: snackTime },
      { meal_type: 'dinner', food_description: dinnerFood, meal_time: dinnerTime },
    ];

    try {
      await healthApi.submitDailyHealth({
        sleep_time: sleepTime,
        wake_time: wakeTime,
        sleep_duration: sleepDuration,
        exercise: didExercise,
        exercise_type: didExercise ? exerciseType : '',
        exercise_duration: didExercise ? exerciseDuration : 0,
        walking: didWalk,
        walking_duration: didWalk ? walkingDuration : 0,
        steps: didWalk ? steps : 0,
        smoking: didSmoke,
        smoking_frequency: didSmoke ? smokingFreq : 0,
        alcohol: didAlcohol,
        alcohol_frequency: didAlcohol ? alcoholFreq : 0,
        meals: meals
      });

      await refreshAll();
      setSaveSuccess(true);
      
      // Celebrate milestone logging
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
      } catch (e) {}

      setTimeout(() => {
        setSaveSuccess(false);
        if (onSuccess) onSuccess();
      }, 1200);

    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save health record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Day Progress Banner */}
      <div className="p-6 rounded-2xl glass-panel-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Digital Twin Daily Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('daily.day_title')} <span className="text-cyan-400">#{currentDay}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t('daily.day_subtitle')}
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
          <span className="text-[11px] text-slate-400 block">Current Date</span>
          <span className="text-sm font-mono font-bold text-white">
            {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {errorMessage}
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{t('daily.saved_success')}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Sleep Section */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center space-x-3 text-indigo-400">
            <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{t('daily.sleep_section')}</h3>
              <p className="text-xs text-slate-400">Sleep timing and automatic duration calculation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('daily.sleep_time')}
              </label>
              <input
                type="text"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                placeholder="11:30 PM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('daily.wake_time')}
              </label>
              <input
                type="text"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                placeholder="06:30 AM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('daily.calculated_duration')}
              </label>
              <div className="px-3.5 py-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-sm font-bold text-indigo-300 flex items-center justify-between">
                <span>{sleepDuration} hours</span>
                <span className="text-[10px] text-slate-400">Automated</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Exercise Section */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-emerald-400">
              <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{t('daily.exercise_section')}</h3>
                <p className="text-xs text-slate-400">{t('daily.did_exercise')}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setDidExercise(true)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  didExercise
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {t('common.yes')}
              </button>
              <button
                type="button"
                onClick={() => setDidExercise(false)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  !didExercise
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {t('common.no')}
              </button>
            </div>
          </div>

          {didExercise && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('daily.exercise_type')}
                </label>
                <input
                  type="text"
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  placeholder="e.g. Walking, Gym, Yoga, Running"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('daily.exercise_duration')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={360}
                  value={exerciseDuration}
                  onChange={(e) => setExerciseDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Walking & Mobility Section */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-cyan-400">
              <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{t('daily.walking_section')}</h3>
                <p className="text-xs text-slate-400">{t('daily.did_walk')}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setDidWalk(true)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  didWalk
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {t('common.yes')}
              </button>
              <button
                type="button"
                onClick={() => setDidWalk(false)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  !didWalk
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {t('common.no')}
              </button>
            </div>
          </div>

          {didWalk && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('daily.walking_duration')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={walkingDuration}
                  onChange={(e) => setWalkingDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('daily.steps_count')}
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  placeholder="e.g. 5200"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. Lifestyle Habits (Smoking & Alcohol) */}
        <div className="p-6 rounded-2xl glass-panel space-y-5">
          <div className="flex items-center space-x-3 text-slate-300">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
              <Cigarette className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{t('daily.habits_section')}</h3>
              <p className="text-xs text-slate-400">Non-judgmental, neutral health indicators</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
            {/* Smoking */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">{t('daily.did_smoke')}</span>
                <div className="flex space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setDidSmoke(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${didSmoke ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {t('common.yes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDidSmoke(false); setSmokingFreq(0); }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${!didSmoke ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {t('common.no')}
                  </button>
                </div>
              </div>
              {didSmoke && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{t('daily.smoking_frequency')}</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={smokingFreq}
                    onChange={(e) => setSmokingFreq(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Alcohol */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">{t('daily.did_alcohol')}</span>
                <div className="flex space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setDidAlcohol(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${didAlcohol ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {t('common.yes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDidAlcohol(false); setAlcoholFreq(0); }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${!didAlcohol ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {t('common.no')}
                  </button>
                </div>
              </div>
              {didAlcohol && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{t('daily.alcohol_frequency')}</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={alcoholFreq}
                    onChange={(e) => setAlcoholFreq(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. Daily Food & Meals Section */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center space-x-3 text-amber-400">
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/30">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{t('daily.meals_section')}</h3>
              <p className="text-xs text-slate-400">Natural meal logging for circadian timing intelligence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            {/* Breakfast */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-300">{t('daily.breakfast')}</span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-slate-500" />
                  {breakfastTime}
                </span>
              </div>
              <input
                type="text"
                value={breakfastFood}
                onChange={(e) => setBreakfastFood(e.target.value)}
                placeholder="What did you eat? (e.g. 2 idli and sambar)"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <input
                type="text"
                value={breakfastTime}
                onChange={(e) => setBreakfastTime(e.target.value)}
                placeholder="Time (e.g. 08:30 AM)"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Lunch */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-300">{t('daily.lunch')}</span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-slate-500" />
                  {lunchTime}
                </span>
              </div>
              <input
                type="text"
                value={lunchFood}
                onChange={(e) => setLunchFood(e.target.value)}
                placeholder="What did you eat? (e.g. Rice, vegetables, chicken)"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <input
                type="text"
                value={lunchTime}
                onChange={(e) => setLunchTime(e.target.value)}
                placeholder="Time (e.g. 01:15 PM)"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Snacks */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-300">{t('daily.snack')}</span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-slate-500" />
                  {snackTime}
                </span>
              </div>
              <input
                type="text"
                value={snackFood}
                onChange={(e) => setSnackFood(e.target.value)}
                placeholder="What did you eat? (e.g. Tea and biscuits)"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <input
                type="text"
                value={snackTime}
                onChange={(e) => setSnackTime(e.target.value)}
                placeholder="Time (e.g. 05:00 PM)"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Dinner */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-300">{t('daily.dinner')}</span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-slate-500" />
                  {dinnerTime}
                </span>
              </div>
              <input
                type="text"
                value={dinnerFood}
                onChange={(e) => setDinnerFood(e.target.value)}
                placeholder="What did you eat? (e.g. Chapati and vegetables)"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <input
                type="text"
                value={dinnerTime}
                onChange={(e) => setDinnerTime(e.target.value)}
                placeholder="Time (e.g. 08:45 PM)"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? t('common.loading') : t('daily.save_daily_record')}</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </form>
    </div>
  );
};
