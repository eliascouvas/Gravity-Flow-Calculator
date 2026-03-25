import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, Info, ArrowRightLeft, Ruler, ChevronDown, Play, Droplets, Sun, Moon, AlertTriangle, Settings, Layers, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Unit = 'm' | 'cm' | 'mm' | 'ft' | 'in';
type Language = 'en' | 'el';

const translations = {
  en: {
    title: 'Gravity Flow Calculator',
    subtitle: 'Pure Gravitational System • CM Rise Standard',
    pipeSpec: 'Pipe Specification',
    material: 'Material',
    pressure: 'Pressure (ATM)',
    diameter: 'Internal Diameter (mm)',
    parameters: 'Parameters',
    pipeLength: 'Pipe Length',
    startRise: 'Start Rise (cm)',
    endRise: 'End Rise (cm)',
    simulate: 'Simulate Gravity Flow',
    flowing: 'Flowing...',
    noFlow: 'No Gravity Flow',
    schematic: 'Gravity Schematic',
    start: 'Start',
    exit: 'Exit',
    legendFlow: 'Flow',
    legendSediment: 'Sediment',
    legendPipe: 'Pipe',
    legendGround: 'Ground',
    results: 'Results',
    velocity: 'Flow Velocity',
    slope: 'Gradient (Slope)',
    angle: 'Pipe Angle',
    drop: 'Vertical Drop',
    ratio: 'Ratio 1:X',
    hydraulicData: 'Hydraulic Data',
    warning: 'Velocity below self-cleansing threshold',
    estimated: 'Estimated for',
    calcNote: 'Uses Manning\'s Equation for a',
    cleansingNote: 'A velocity of at least 0.7 m/s is typically required to prevent sediment buildup.',
    footer: 'Professional Engineering Tool • Built with Precision',
    errorRise: 'Rise difference cannot exceed pipe length',
    errorDiam: 'Invalid diameter',
    enterParams: 'Enter valid parameters to see results'
  },
  el: {
    title: 'Υπολογιστης Ροης Βαρυτητας',
    subtitle: 'Συστημα Καθαρης Βαρυτητας • Προτυπο Ανυψωσης CM',
    pipeSpec: 'Προδιαγραφες Σωληνα',
    material: 'Υλικο',
    pressure: 'Πιεση (ATM)',
    diameter: 'Εσωτερικη Διαμετρος (mm)',
    parameters: 'Παραμετροι',
    pipeLength: 'Μηκος Σωληνα',
    startRise: 'Αρχικη Ανυψωση (cm)',
    endRise: 'Τελικη Ανυψωση (cm)',
    simulate: 'Προσομοιωση Ροης Βαρυτητας',
    flowing: 'Ροη...',
    noFlow: 'Χωρις Ροη Βαρυτητας',
    schematic: 'Σχηματικο Βαρυτητας',
    start: 'Αρχη',
    exit: 'Εξοδος',
    legendFlow: 'Ροη',
    legendSediment: 'Ιζημα',
    legendPipe: 'Σωληνας',
    legendGround: 'Εδαφος',
    results: 'Αποτελεσματα',
    velocity: 'Ταχυτητα Ροης',
    slope: 'Κλιση',
    angle: 'Γωνια Σωληνα',
    drop: 'Κατακορυφη Πτωση',
    ratio: 'Λογος 1:X',
    hydraulicData: 'Υδραυλικα Δεδομενα',
    warning: 'Ταχυτητα κατω απο το οριο αυτοκαθαρισμου',
    estimated: 'Εκτιμωμενο για',
    calcNote: 'Χρησιμοποιει την εξισωση Manning για',
    cleansingNote: 'Απαιτειται ταχυτητα τουλαχιστον 0,7 m/s για την αποφυγη συσσωρευσης ιζηματων.',
    footer: 'Επαγγελματικο Εργαλειο Μηχανικης • Κατασκευασμενο με Ακριβεια',
    errorRise: 'Η διαφορα ανυψωσης δεν μπορει να υπερβαινει το μηκος του σωληνα',
    errorDiam: 'Μη εγκυρη διαμετρος',
    enterParams: 'Εισαγαγετε εγκυρες παραμετρους για να δειτε αποτελεσματα'
  }
};

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];
  const [length, setLength] = useState<string>('10');
  const [riseStart, setRiseStart] = useState<string>('150'); // Default in cm
  const [riseEnd, setRiseEnd] = useState<string>('120');   // Default in cm
  const [unit, setUnit] = useState<Unit>('m');
  const [isFlowing, setIsFlowing] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [isSchematicLight, setIsSchematicLight] = useState(false);
  const [material, setMaterial] = useState<'PVC' | 'Acrylic'>('PVC');
  const [diameter, setDiameter] = useState<string>('100');
  const [atm, setAtm] = useState<string>('10');

  // Manning's n values
  const roughness = {
    PVC: 0.013,
    Acrylic: 0.010
  };

  // Conversion factors to Meters
  const toMeters = {
    m: 1,
    cm: 0.01,
    mm: 0.001,
    ft: 0.3048,
    in: 0.0254
  };

  const calculations = useMemo(() => {
    const L_raw = parseFloat(length);
    const h1_cm = parseFloat(riseStart);
    const h2_cm = parseFloat(riseEnd);

    if (isNaN(L_raw) || isNaN(h1_cm) || isNaN(h2_cm) || L_raw <= 0) {
      return null;
    }

    // Convert everything to meters for internal calculation
    const L = L_raw * toMeters[unit];
    const h1 = h1_cm * 0.01;
    const h2 = h2_cm * 0.01;

    const deltaH = Math.abs(h1 - h2);
    
    if (deltaH > L) return { error: t.errorRise };

    const angleRad = Math.asin(deltaH / L);
    const angleDeg = angleRad * (180 / Math.PI);
    
    const run = Math.sqrt(L * L - deltaH * deltaH);
    const slope = run > 0 ? (deltaH / run) : 0;
    const slopePercent = slope * 100;
    const ratioX = deltaH > 0 ? run / deltaH : Infinity;

    // Manning's Equation for Velocity (V = (1/n) * Rh^(2/3) * S^(1/2))
    const n = roughness[material];
    const D = parseFloat(diameter) * 0.001; // Convert mm to meters
    if (isNaN(D) || D <= 0) return { error: t.errorDiam };
    
    const Rh = D / 4;
    const velocity = (1 / n) * Math.pow(Rh, 2/3) * Math.sqrt(slope);

    return {
      angleDeg,
      slopePercent,
      ratioX,
      deltaH: deltaH / toMeters[unit], // Convert back to display unit
      run: run / toMeters[unit],       // Convert back to display unit
      velocity, // in m/s
      n,
      D_mm: parseFloat(diameter),
      error: null
    };
  }, [length, riseStart, riseEnd, unit, material, diameter]);

  const handleSimulate = () => {
    if (calculations && !calculations.error) {
      const h1 = parseFloat(riseStart);
      const h2 = parseFloat(riseEnd);
      
      if (h2 >= h1) {
        // In a gravity system, flow won't move "up"
        return;
      }

      setIsFlowing(true);
      setHasSimulated(true);
      setTimeout(() => setIsFlowing(false), 3000);
    }
  };

  // Reset simulation state when inputs change
  useEffect(() => {
    setHasSimulated(false);
  }, [length, riseStart, riseEnd, unit]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex items-center justify-between border-b border-[#E5E5E5] pb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-light tracking-tight text-[#111]">
              {lang === 'en' ? (
                <>Gravity <span className="font-semibold">Flow</span> Calculator</>
              ) : (
                <>Υπολογιστής <span className="font-semibold">Ροής</span> Βαρύτητας</>
              )}
            </h1>
            <p className="text-sm text-[#666] mt-1 uppercase tracking-wider font-medium">
              {t.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-white border border-[#EEE] rounded-lg px-2 py-1 shadow-sm">
              <Languages size={14} className="text-[#999]" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Language)}
                className="text-[10px] font-bold uppercase appearance-none bg-transparent pr-4 focus:outline-none cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="el">EL</option>
              </select>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[#999] text-xs font-mono">
              <Calculator size={14} />
              <span>v1.4.0</span>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs Section */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]">
              <div className="flex items-center gap-2 mb-6 text-[#111]">
                <Settings size={18} className="text-[#4A4A4A]" />
                <h2 className="text-sm font-bold uppercase tracking-widest">{t.pipeSpec}</h2>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#999] uppercase mb-1.5 ml-1">
                      {t.material}
                    </label>
                    <div className="relative">
                      <select 
                        value={material} 
                        onChange={(e) => setMaterial(e.target.value as 'PVC' | 'Acrylic')}
                        className="w-full bg-[#F9F9F9] border border-[#EEE] rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A4A4A] transition-colors font-mono text-sm appearance-none"
                      >
                        <option value="PVC">PVC</option>
                        <option value="Acrylic">Acrylic</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#999]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#999] uppercase mb-1.5 ml-1">
                      {t.pressure}
                    </label>
                    <div className="relative">
                      <select 
                        value={atm} 
                        onChange={(e) => setAtm(e.target.value)}
                        className="w-full bg-[#F9F9F9] border border-[#EEE] rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A4A4A] transition-colors font-mono text-sm appearance-none"
                      >
                        <option value="6">6 ATM</option>
                        <option value="10">10 ATM</option>
                        <option value="16">16 ATM</option>
                        <option value="20">20 ATM</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#999]" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#999] uppercase mb-1.5 ml-1">
                    {t.diameter}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={diameter}
                      onChange={(e) => setDiameter(e.target.value)}
                      className="w-full bg-[#F9F9F9] border border-[#EEE] rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A4A4A] transition-colors font-mono text-lg"
                      placeholder="100"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#AAA] uppercase">
                      mm
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]">
              <div className="flex items-center gap-2 mb-6 text-[#111]">
                <Ruler size={18} className="text-[#4A4A4A]" />
                <h2 className="text-sm font-bold uppercase tracking-widest">{t.parameters}</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-[#999] uppercase mb-1.5 ml-1">
                    {t.pipeLength} ({unit})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full bg-[#F9F9F9] border border-[#EEE] rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A4A4A] transition-colors font-mono text-lg"
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white border border-[#EEE] rounded-md px-2 py-1 shadow-sm">
                      <select 
                        value={unit} 
                        onChange={(e) => setUnit(e.target.value as Unit)}
                        className="text-[10px] font-bold uppercase appearance-none bg-transparent pr-4 focus:outline-none cursor-pointer"
                      >
                        <option value="m">{lang === 'en' ? 'Meters' : 'Μέτρα'}</option>
                        <option value="cm">CM</option>
                        <option value="mm">MM</option>
                        <option value="ft">{lang === 'en' ? 'Feet' : 'Πόδια'}</option>
                        <option value="in">{lang === 'en' ? 'Inches' : 'Ίντσες'}</option>
                      </select>
                      <ChevronDown size={10} className="absolute right-2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#999] uppercase mb-1.5 ml-1">
                      {t.startRise}
                    </label>
                    <input
                      type="number"
                      value={riseStart}
                      onChange={(e) => setRiseStart(e.target.value)}
                      className="w-full bg-[#F9F9F9] border border-[#EEE] rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A4A4A] transition-colors font-mono text-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#999] uppercase mb-1.5 ml-1">
                      {t.endRise}
                    </label>
                    <input
                      type="number"
                      value={riseEnd}
                      onChange={(e) => setRiseEnd(e.target.value)}
                      className="w-full bg-[#F9F9F9] border border-[#EEE] rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A4A4A] transition-colors font-mono text-lg"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSimulate}
                  disabled={!!calculations?.error || isFlowing || parseFloat(riseEnd) >= parseFloat(riseStart)}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm transition-all ${
                    isFlowing 
                    ? 'bg-[#4A4A4A] text-white cursor-not-allowed' 
                    : parseFloat(riseEnd) >= parseFloat(riseStart)
                    ? 'bg-[#EEE] text-[#AAA] cursor-not-allowed'
                    : 'bg-[#111] text-white hover:bg-[#333] active:scale-[0.98]'
                  }`}
                >
                  {isFlowing ? (
                    <>
                      <Droplets className="animate-bounce" size={18} />
                      {t.flowing}
                    </>
                  ) : parseFloat(riseEnd) >= parseFloat(riseStart) ? (
                    <>
                      <Info size={18} />
                      {t.noFlow}
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      {t.simulate}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Visual Aid */}
            <div className={`rounded-2xl p-6 shadow-lg overflow-hidden relative transition-colors duration-300 ${
              isSchematicLight ? 'bg-white border border-[#E5E5E5] text-[#111]' : 'bg-[#151619] text-white'
            }`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 opacity-50">
                  <ArrowRightLeft size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t.schematic}</span>
                </div>
                <button 
                  onClick={() => setIsSchematicLight(!isSchematicLight)}
                  className={`p-2 rounded-lg transition-colors ${
                    isSchematicLight ? 'bg-[#F5F5F5] hover:bg-[#EEE]' : 'bg-[#252629] hover:bg-[#353639]'
                  }`}
                >
                  {isSchematicLight ? <Moon size={14} /> : <Sun size={14} />}
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative">
                <div className="flex-1 w-full h-48 flex items-center justify-center">
                  <svg width="100%" height="100%" viewBox="0 -10 200 110" preserveAspectRatio="xMidYMid meet">
                    {/* Ground Line */}
                    <line 
                      x1="10" y1="90" x2="190" y2="90" 
                      stroke={isSchematicLight ? "#EEE" : "#333"} 
                      strokeWidth="1" 
                      strokeDasharray="4 4" 
                    />
                    
                    {/* Pipe */}
                    {calculations && !calculations.error && (
                      <>
                        {/* Pipe Body */}
                        <line 
                          x1="20" 
                          y1={90 - (parseFloat(riseStart) / 200) * 80} 
                          x2="180" 
                          y2={90 - (parseFloat(riseEnd) / 200) * 80} 
                          stroke={isSchematicLight ? "#E5E5E5" : "#333"} 
                          strokeWidth="8" 
                          strokeLinecap="round"
                        />
                        <line 
                          x1="20" 
                          y1={90 - (parseFloat(riseStart) / 200) * 80} 
                          x2="180" 
                          y2={90 - (parseFloat(riseEnd) / 200) * 80} 
                          stroke={isSchematicLight ? "#DDD" : "#444"} 
                          strokeWidth="6" 
                          strokeLinecap="round"
                        />

                        {/* Sediment Buildup (Visible if velocity < 0.7 and simulation has run) */}
                        {calculations.velocity < 0.7 && hasSimulated && (
                          <motion.path
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: 0.6, scaleY: 1 }}
                            d={`M 20 ${90 - (parseFloat(riseStart) / 200) * 80 + 3} 
                               L 180 ${90 - (parseFloat(riseEnd) / 200) * 80 + 3} 
                               L 180 ${90 - (parseFloat(riseEnd) / 200) * 80 + 1} 
                               L 20 ${90 - (parseFloat(riseStart) / 200) * 80 + 1} Z`}
                            fill="#4B3621"
                            className="origin-bottom"
                          />
                        )}

                        {/* Water Animation */}
                        <AnimatePresence>
                          {isFlowing && (
                            <>
                              {/* Main Flow Stream */}
                              <motion.line
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.2, ease: "linear" }}
                                x1="20" 
                                y1={90 - (parseFloat(riseStart) / 200) * 80} 
                                x2="180" 
                                y2={90 - (parseFloat(riseEnd) / 200) * 80} 
                                stroke="#3B82F6" 
                                strokeWidth="4" 
                                strokeLinecap="round"
                              />

                              {/* Particles (Bubbles/Residues) */}
                              {calculations.velocity < 0.7 && [1, 2, 3, 4, 5].map((i) => (
                                <motion.circle
                                  key={`particle-${i}`}
                                  r={i % 2 === 0 ? 1.5 : 1}
                                  fill={i % 2 === 0 ? (isSchematicLight ? "#3B82F6" : "#FFF") : "#8B4513"} // Bubbles (blue in light, white in dark), brown residues
                                  initial={{ 
                                    cx: 20, 
                                    cy: 90 - (parseFloat(riseStart) / 200) * 80,
                                    opacity: 0 
                                  }}
                                  animate={{ 
                                    cx: 180, 
                                    cy: 90 - (parseFloat(riseEnd) / 200) * 80,
                                    opacity: [0, 1, 1, 0]
                                  }}
                                  transition={{ 
                                    duration: 2.5, 
                                    delay: i * 0.4, 
                                    repeat: Infinity,
                                    ease: "linear" 
                                  }}
                                />
                              ))}
                            </>
                          )}
                        </AnimatePresence>

                        {/* Labels */}
                        <text 
                          x="20" 
                          y={90 - (parseFloat(riseStart) / 200) * 80 - 12} 
                          fill={isSchematicLight ? "#999" : "#666"} 
                          fontSize="6" 
                          textAnchor="middle"
                          className="font-bold tracking-wider"
                        >
                          {t.start} ({riseStart}cm)
                        </text>
                        <text 
                          x="180" 
                          y={90 - (parseFloat(riseEnd) / 200) * 80 - 12} 
                          fill={isSchematicLight ? "#999" : "#666"} 
                          fontSize="6" 
                          textAnchor="middle"
                          className="font-bold tracking-wider"
                        >
                          {t.exit} ({riseEnd}cm)
                        </text>
                      </>
                    )}
                  </svg>
                </div>

                {/* Legend */}
                <div className={`flex flex-col gap-3 p-3 rounded-xl border ${
                  isSchematicLight ? 'bg-[#F9F9F9] border-[#EEE]' : 'bg-[#202124] border-[#333]'
                } min-w-[120px]`}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{t.legendFlow}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#4B3621]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{t.legendSediment}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-1.5 rounded-sm ${isSchematicLight ? 'bg-[#DDD]' : 'bg-[#444]'}`} />
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{t.legendPipe}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0 border-t border-dashed border-current opacity-30" />
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{t.legendGround}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Results Section */}
          <section className="lg:col-span-7">
            {calculations?.error ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Info className="text-red-600" size={24} />
                </div>
                <h3 className="text-red-900 font-bold uppercase tracking-widest text-sm mb-2">{lang === 'en' ? 'Calculation Error' : 'Σφάλμα Υπολογισμού'}</h3>
                <p className="text-red-700 text-sm">{calculations.error}</p>
              </div>
            ) : calculations ? (
              <div className="space-y-6 h-full flex flex-col">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E5E5E5] flex-1">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#111]">{t.results}</h2>
                    <span className="px-2 py-1 bg-[#F0F0F0] rounded text-[10px] font-bold text-[#666]">UOM: CM RISE</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <label className="block text-[11px] font-bold text-[#999] uppercase mb-2">{t.velocity}</label>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-6xl font-light tracking-tighter transition-colors duration-300 ${
                          calculations.velocity < 0.7 ? 'text-red-600' : 'text-[#3B82F6]'
                        }`}>
                          {calculations.velocity.toFixed(2)}
                        </span>
                        <span className={`text-2xl font-light transition-colors duration-300 ${
                          calculations.velocity < 0.7 ? 'text-red-400' : 'text-[#999]'
                        }`}>m/s</span>
                      </div>
                      
                      {calculations.velocity < 0.7 ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-lg border border-red-100"
                        >
                          <AlertTriangle size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-tight">
                            {t.warning}
                          </span>
                        </motion.div>
                      ) : (
                        <p className="text-[10px] text-[#BBB] mt-2 font-mono uppercase">
                          {t.estimated} {calculations.D_mm}mm {material} ({atm} ATM)
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#999] uppercase mb-2">{t.slope}</label>
                      <div className="flex items-baseline gap-1">
                        <span className="text-6xl font-light tracking-tighter text-[#111]">
                          {calculations.slopePercent.toFixed(2)}
                        </span>
                        <span className="text-2xl font-light text-[#999]">%</span>
                      </div>
                      <p className="text-[10px] text-[#BBB] mt-2 font-mono uppercase">{lang === 'en' ? 'Rise over run percentage' : 'Ποσοστό ανύψωσης προς μήκος'}</p>
                    </div>
                  </div>

                  <div className="mt-16 grid grid-cols-3 gap-4">
                    <div className="p-4 bg-[#F9F9F9] rounded-xl border border-[#EEE]">
                      <label className="block text-[9px] font-bold text-[#AAA] uppercase mb-1">{t.angle}</label>
                      <div className="text-lg font-mono text-[#444]">
                        {calculations.angleDeg.toFixed(2)}°
                      </div>
                    </div>
                    <div className="p-4 bg-[#F9F9F9] rounded-xl border border-[#EEE]">
                      <label className="block text-[9px] font-bold text-[#AAA] uppercase mb-1">{t.drop}</label>
                      <div className="text-lg font-mono text-[#444]">
                        {Math.abs(parseFloat(riseStart) - parseFloat(riseEnd)).toFixed(1)} <span className="text-xs text-[#999]">cm</span>
                      </div>
                    </div>
                    <div className="p-4 bg-[#F9F9F9] rounded-xl border border-[#EEE]">
                      <label className="block text-[9px] font-bold text-[#AAA] uppercase mb-1">{t.ratio}</label>
                      <div className="text-lg font-mono text-[#444]">
                        1 : {calculations.ratioX === Infinity ? '∞' : calculations.ratioX.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#E4E3E0] rounded-2xl p-6 border border-[#D1D1D1]">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#111] rounded-full" />
                    {t.hydraulicData}
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-[11px] text-[#555] leading-relaxed">
                      <span className="font-bold text-[#111]">{lang === 'en' ? 'Velocity Calculation:' : 'Υπολογισμός Ταχύτητας:'}</span> {t.calcNote} {calculations.D_mm}mm {material} pipe ($n={calculations.n}$).
                    </div>
                    <div className="text-[11px] text-[#555] leading-relaxed">
                      <span className="font-bold text-[#111]">{lang === 'en' ? 'Self-Cleansing:' : 'Αυτοκαθαρισμός:'}</span> {t.cleansingNote}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E5E5E5] border-dashed flex flex-col items-center justify-center text-center h-full opacity-50">
                <Calculator size={48} className="text-[#DDD] mb-4" />
                <p className="text-sm text-[#999]">{t.enterParams}</p>
              </div>
            )}
          </section>
        </main>

        <footer className="mt-12 pt-8 border-top border-[#E5E5E5] text-center">
          <p className="text-[10px] text-[#AAA] uppercase tracking-[0.2em]">
            {t.footer}
          </p>
        </footer>
      </div>
    </div>
  );
}

