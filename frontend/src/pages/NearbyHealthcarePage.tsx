import React from 'react';
import {
  Hospital,
  MapPin,
  Phone,
  Star,
  ShieldAlert,
  Navigation,
  ExternalLink,
  UserCheck,
  Building2,
  Stethoscope
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useDigitalTwin } from '../context/DigitalTwinContext';

export const NearbyHealthcarePage: React.FC = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const { healthcareFacilities, predictions } = useDigitalTwin();

  const userCity = profile?.place || 'Chennai';

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-cyan-400 font-semibold mb-1">
            <Hospital className="w-4 h-4" />
            <span>Clinical Support & Triage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('dashboard.nearby_healthcare_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Specialist doctor and facility matching based on your location ({userCity}) and detected risk indicators.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>Location: <strong>{userCity}</strong></span>
        </div>
      </div>

      {/* Advisory Callout */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/30 flex items-start space-x-3 text-xs text-slate-300">
        <Stethoscope className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Physician Consultation Advisory:</strong> Your Digital Twin provides predictive wellness indicators to assist in proactive health management. For symptoms, persistent deconditioning, or formal clinical diagnosis, consult an accredited medical specialist.
        </p>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {healthcareFacilities.map((fac) => (
          <div
            key={fac.id}
            className="p-6 rounded-2xl glass-card-interactive border border-slate-700/80 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                      {fac.facility_type}
                    </span>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {fac.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{fac.rating}</span>
                </div>
              </div>

              {/* Specialist Matched */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Recommended Specialist:</span>
                  <span className="font-bold text-cyan-300 flex items-center">
                    <UserCheck className="w-3.5 h-3.5 mr-1" />
                    {fac.specialist_type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-700/50">
                  "{fac.matching_reason}"
                </div>
              </div>

              {/* Address & Distance */}
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>{fac.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="text-cyan-300 font-semibold">{fac.distance_km} km from your location</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <a
                href={`tel:${fac.phone}`}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>{fac.phone}</span>
              </a>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(fac.name + ' ' + fac.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-cyan-500/20"
              >
                <span>Get Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
