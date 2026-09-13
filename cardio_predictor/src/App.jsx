import React, { useState, useEffect, useMemo } from 'react';
import { 
  HeartPulse, 
  Activity, 
  ShieldAlert, 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  UserCheck, 
  Sun, 
  Moon, 
  Zap, 
  Award, 
  Stethoscope, 
  BarChart3, 
  SlidersHorizontal, 
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Gauge,
  Flame,
  Wine,
  Dumbbell,
  Cigarette,
  ChevronRight,
  Info,
  Users,
  Search,
  Download,
  Plus,
  Trash2,
  Eye,
  FileText,
  Calculator,
  BookOpen,
  Settings,
  X,
  Printer,
  Check,
  LayoutDashboard,
  Filter,
  PieChart,
  History,
  Heart,
  Scale,
  AlertCircle
} from 'lucide-react';

const PRESETS = {
  NORMAL: {
    name: 'Sarah Jenkins',
    age: 32, gender: 1, height: 165, weight: 60,
    ap_hi: 115, ap_lo: 75, cholesterol: 1, gluc: 1,
    smoke: 0, alco: 0, active: 1
  },
  MEDIUM_RISK: {
    name: 'Robert Vance',
    age: 48, gender: 2, height: 172, weight: 78,
    ap_hi: 135, ap_lo: 85, cholesterol: 2, gluc: 1,
    smoke: 0, alco: 0, active: 0
  },
  HIGH_RISK: {
    name: 'David Miller',
    age: 58, gender: 2, height: 170, weight: 88,
    ap_hi: 155, ap_lo: 95, cholesterol: 3, gluc: 2,
    smoke: 1, alco: 0, active: 0
  }
};

const EMPTY_FORM = {
  age: '',
  gender: 1,
  height: '',
  weight: '',
  ap_hi: '',
  ap_lo: '',
  cholesterol: 1,
  gluc: 1,
  smoke: 0,
  alco: 0,
  active: 1
};

const INITIAL_HISTORY = [
  { id: 'REC-901', name: 'Eleanor Vance', date: '2026-09-12', age: 62, gender: 1, ap_hi: 160, ap_lo: 98, score: 78.4, level: 'High Risk', model: 'Gradient Boosting' },
  { id: 'REC-902', name: 'Marcus Sterling', date: '2026-09-11', age: 44, gender: 2, ap_hi: 128, ap_lo: 82, score: 42.1, level: 'Moderate Risk', model: 'Random Forest' },
  { id: 'REC-903', name: 'Aisha Patel', date: '2026-09-10', age: 31, gender: 1, ap_hi: 112, ap_lo: 74, score: 14.5, level: 'Low Risk', model: 'Gradient Boosting' },
  { id: 'REC-904', name: 'Arthur Pendelton', date: '2026-09-09', age: 56, gender: 2, ap_hi: 145, ap_lo: 92, score: 64.8, level: 'High Risk', model: 'Extra Trees' },
  { id: 'REC-905', name: 'Clara Oswald', date: '2026-09-08', age: 29, gender: 1, ap_hi: 118, ap_lo: 76, score: 18.2, level: 'Low Risk', model: 'Logistic Regression' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('predictor'); 
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Form State & Touched / Unfocus state for error display
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [patientName, setPatientName] = useState('');
  const [hasCalculated, setHasCalculated] = useState(false);

  // Available ML Models
  const [availableModels, setAvailableModels] = useState([
    { name: 'Gradient Boosting', accuracy: 73.01, precision: 75.17, recall: 68.23, f1: 71.53, is_best: true, speed: '12ms' },
    { name: 'Random Forest', accuracy: 72.70, precision: 75.55, recall: 66.63, f1: 70.81, speed: '18ms' },
    { name: 'Logistic Regression', accuracy: 72.39, precision: 75.18, recall: 66.35, f1: 70.49, speed: '5ms' },
    { name: 'Scratch Logistic Reg', accuracy: 72.49, precision: 75.25, recall: 66.51, f1: 70.61, speed: '8ms' },
    { name: 'Extra Trees', accuracy: 72.51, precision: 74.82, recall: 67.35, f1: 70.89, speed: '22ms' },
    { name: 'AdaBoost', accuracy: 72.49, precision: 76.40, recall: 64.59, f1: 70.00, speed: '15ms' },
    { name: 'Decision Tree', accuracy: 71.95, precision: 73.96, recall: 67.21, f1: 70.43, speed: '4ms' },
    { name: 'Naive Bayes', accuracy: 70.57, precision: 75.75, recall: 59.98, f1: 66.95, speed: '3ms' }
  ]);
  const [selectedModel, setSelectedModel] = useState('Gradient Boosting');
  const [bestModelName, setBestModelName] = useState('Gradient Boosting');

  const [riskScore, setRiskScore] = useState(0);
  const [riskFactors, setRiskFactors] = useState([]);
  const [modelMetrics, setModelMetrics] = useState({ accuracy: 73.01, precision: 75.17, recall: 68.23, f1: 71.53 });
  const [apiConnected, setApiConnected] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [metricHighlight, setMetricHighlight] = useState(false);

  // Permanent Local Storage for Patient History
  const [patientHistory, setPatientHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('cardio_patient_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load patient history from localStorage:', e);
    }
    return INITIAL_HISTORY;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cardio_patient_history', JSON.stringify(patientHistory));
    } catch (e) {
      console.error('Failed to persist patient history:', e);
    }
  }, [patientHistory]);

  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const [selectedRecordModal, setSelectedRecordModal] = useState(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // Field Validation & Empty Checks
  const isFormEmpty = useMemo(() => {
    return formData.age === '' || formData.height === '' || formData.weight === '' || formData.ap_hi === '' || formData.ap_lo === '';
  }, [formData]);

  const validationErrors = useMemo(() => {
    const errs = {};
    if (formData.age === '' && formData.height === '' && formData.weight === '' && formData.ap_hi === '' && formData.ap_lo === '') {
      return errs;
    }

    const age = Number(formData.age);
    const height = Number(formData.height);
    const weight = Number(formData.weight);
    const ap_hi = Number(formData.ap_hi);
    const ap_lo = Number(formData.ap_lo);

    if (formData.age !== '' && (isNaN(age) || age < 18 || age > 100)) {
      errs.age = 'Age must be between 18 and 100 years.';
    }
    if (formData.height !== '' && (isNaN(height) || height < 50 || height > 250)) {
      errs.height = 'Height must be between 50 and 250 cm.';
    }
    if (formData.weight !== '' && (isNaN(weight) || weight < 20 || weight > 250)) {
      errs.weight = 'Weight must be between 20 and 250 kg.';
    }
    if (formData.ap_hi !== '' && (isNaN(ap_hi) || ap_hi < 70 || ap_hi > 240)) {
      errs.ap_hi = 'Systolic BP must be between 70 and 240 mmHg.';
    }
    if (formData.ap_lo !== '' && (isNaN(ap_lo) || ap_lo < 40 || ap_lo > 160)) {
      errs.ap_lo = 'Diastolic BP must be between 40 and 160 mmHg.';
    }
    if (formData.ap_hi !== '' && formData.ap_lo !== '' && !errs.ap_hi && !errs.ap_lo && ap_lo >= ap_hi) {
      errs.ap_lo = 'Diastolic BP must be lower than Systolic BP.';
    }

    return errs;
  }, [formData]);

  const hasErrors = Object.keys(validationErrors).length > 0;

  // Sync modelMetrics dynamically whenever selectedModel or availableModels change
  useEffect(() => {
    const currentModelData = availableModels.find((m) => m.name === selectedModel);
    if (currentModelData) {
      setModelMetrics({
        accuracy: currentModelData.accuracy,
        precision: currentModelData.precision,
        recall: currentModelData.recall,
        f1: currentModelData.f1
      });
      setMetricHighlight(true);
      const timer = setTimeout(() => setMetricHighlight(false), 600);
      return () => clearTimeout(timer);
    }
  }, [selectedModel, availableModels]);

  const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  useEffect(() => {
    fetch(`${API_BASE}/models`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.models.length > 0) {
          setAvailableModels(data.models);
          const topModel = data.best_model || data.default || data.models[0].name;
          setBestModelName(topModel);
        }
      })
      .catch(() => setApiConnected(false));
  }, [API_BASE]);

  const fetchPredictionFromBackend = async (dataToSend, modelName) => {
    if (hasErrors || isFormEmpty) return;
    setIsCalculating(true);
    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dataToSend, selected_model: modelName }),
      });
      const result = await response.json();
      if (result.success) {
        setRiskScore(result.risk_percentage);
        setRiskFactors(result.risk_factors || []);
        if (result.metrics) {
          setModelMetrics(result.metrics);
        } else {
          const found = availableModels.find((m) => m.name === modelName);
          if (found) setModelMetrics({ accuracy: found.accuracy, precision: found.precision, recall: found.recall, f1: found.f1 });
        }
        setApiConnected(true);
        setHasCalculated(true);
      }
    } catch (err) {
      let score = 18;
      if (Number(dataToSend.ap_hi) > 140 || Number(dataToSend.ap_lo) > 90) score += 26;
      if (dataToSend.cholesterol > 1) score += 14 * dataToSend.cholesterol;
      if (dataToSend.smoke) score += 12;
      if (Number(dataToSend.age) > 50) score += 10;
      if (dataToSend.active === 0) score += 8;
      
      const modelBias = {
        'Gradient Boosting': 0,
        'Random Forest': 1.2,
        'Logistic Regression': -1.5,
        'AdaBoost': 2.1,
        'Decision Tree': -0.8,
        'Extra Trees': 0.5,
        'Naive Bayes': -2.4
      };
      score += (modelBias[modelName] || 0);
      score = Math.min(Math.max(score, 5), 95);
      
      setRiskScore(score);
      setApiConnected(false);
      setHasCalculated(true);
    } finally {
      setTimeout(() => setIsCalculating(false), 150);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const getRiskDetails = (score) => {
    if (!hasCalculated || isFormEmpty || hasErrors) {
      return {
        level: 'Awaiting Assessment',
        color: isDarkMode ? 'text-slate-400' : 'text-slate-500',
        bg: isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200',
        badge: isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-200 text-slate-700 border-slate-300',
        bar: 'bg-slate-600',
        desc: 'Enter patient biometric values above and click "Run Assessment".'
      };
    }
    if (score < 30) {
      return { 
        level: 'Low Risk', 
        color: isDarkMode ? 'text-emerald-400' : 'text-rose-600', 
        bg: isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-50 border-rose-200', 
        badge: isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-100 text-rose-700 border-rose-300',
        bar: 'bg-emerald-500',
        desc: 'Cardiovascular markers indicate low clinical risk.' 
      };
    } else if (score < 60) {
      return { 
        level: 'Moderate Risk', 
        color: isDarkMode ? 'text-amber-400' : 'text-rose-600', 
        bg: isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-rose-50 border-rose-200', 
        badge: isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-rose-100 text-rose-700 border-rose-300',
        bar: 'bg-amber-500',
        desc: 'Elevated indicators. Lifestyle modifications strongly advised.' 
      };
    } else {
      return { 
        level: 'High Risk', 
        color: isDarkMode ? 'text-rose-400' : 'text-rose-600', 
        bg: isDarkMode ? 'bg-rose-500/10 border-rose-500/30' : 'bg-rose-50 border-rose-200', 
        badge: isDarkMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-rose-100 text-rose-700 border-rose-300',
        bar: 'bg-rose-500',
        desc: 'High probability of cardiovascular complications. Urgent medical review recommended.' 
      };
    }
  };

  const getBloodPressureCategory = (systolic, diastolic) => {
    if (!systolic || !diastolic) return { label: 'Pending Input', color: 'text-slate-400' };
    if (systolic < 120 && diastolic < 80) return { label: 'Normal BP', color: isDarkMode ? 'text-emerald-400' : 'text-emerald-700' };
    if (systolic <= 129 && diastolic < 80) return { label: 'Elevated BP', color: isDarkMode ? 'text-amber-300' : 'text-amber-700' };
    if (systolic <= 139 || diastolic <= 89) return { label: 'Stage 1 Hypertension', color: isDarkMode ? 'text-amber-400' : 'text-amber-800' };
    if (systolic <= 180 || diastolic <= 120) return { label: 'Stage 2 Hypertension', color: isDarkMode ? 'text-rose-400' : 'text-rose-700' };
    return { label: 'Hypertensive Crisis', color: 'text-rose-600 font-bold animate-pulse' };
  };

  const saveCurrentAssessment = () => {
    if (isFormEmpty) {
      showToast('Please fill in all biometric input fields before saving.', 'error');
      return;
    }
    if (hasErrors) {
      showToast('Cannot save record: Please fix out-of-range input values first.', 'error');
      return;
    }
    const riskInfo = getRiskDetails(riskScore);
    const newRecord = {
      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
      name: patientName || 'Anonymous Patient',
      date: new Date().toISOString().split('T')[0],
      age: formData.age,
      gender: formData.gender,
      ap_hi: formData.ap_hi,
      ap_lo: formData.ap_lo,
      score: Number(riskScore.toFixed(1)),
      level: riskInfo.level,
      model: selectedModel
    };
    setPatientHistory([newRecord, ...patientHistory]);
    showToast(`Assessment permanently saved for ${newRecord.name}!`, 'success');
  };

  const riskInfo = getRiskDetails(riskScore);
  const heightM = Number(formData.height) / 100;
  const bmi = (heightM > 0 && formData.weight ? (Number(formData.weight) / (heightM * heightM)).toFixed(1) : '0.0');
  const bpCategory = getBloodPressureCategory(Number(formData.ap_hi), Number(formData.ap_lo));

  // Filtered Patient History
  const filteredHistory = useMemo(() => {
    return patientHistory.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = historyFilter === 'ALL' || item.level.toUpperCase().includes(historyFilter);
      return matchesSearch && matchesFilter;
    });
  }, [patientHistory, searchQuery, historyFilter]);

  // Dynamic Theme Classes
  const t = {
    bg: isDarkMode ? 'bg-[#080d1a] text-slate-100' : 'bg-slate-100 text-slate-900',
    headerBg: isDarkMode ? 'bg-[#091124]/85 border-slate-800/80' : 'bg-white/90 border-slate-200 shadow-sm',
    card: isDarkMode ? 'bg-slate-900/60 border-slate-800/80 text-slate-100 shadow-2xl' : 'bg-white border-slate-200/90 text-slate-900 shadow-xl shadow-slate-200/70',
    cardInner: isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80',
    cardHero: isDarkMode ? 'bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-slate-800/80' : 'bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 border-slate-800 text-white shadow-xl',
    heading: isDarkMode ? 'text-white' : 'text-slate-900',
    subHeading: isDarkMode ? 'text-slate-400' : 'text-slate-600',
    input: isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-rose-500' : 'bg-white border-slate-300 text-slate-900 focus:border-rose-500 shadow-sm',
    inputError: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/10 text-rose-500 font-bold',
    tableHeader: isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700',
    tableRow: isDarkMode ? 'hover:bg-slate-800/40 border-slate-800/80' : 'hover:bg-slate-50 border-slate-200/80',
    buttonSecondary: isDarkMode ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-sm'
  };

  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-300 font-sans`}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-sm font-semibold ${
            toastMessage.type === 'success' 
              ? isDarkMode ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' : 'bg-emerald-900 border-emerald-700 text-white'
              : toastMessage.type === 'error'
              ? 'bg-rose-900 border-rose-700 text-white'
              : isDarkMode ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-slate-900 text-white'
          }`}>
            {toastMessage.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-300" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP NAVIGATION BAR */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b ${t.headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-rose-500/25">
              <HeartPulse className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className={`text-xl font-extrabold tracking-tight ${isDarkMode ? 'bg-gradient-to-r from-white via-slate-200 to-rose-400 bg-clip-text text-transparent' : 'text-slate-900'}`}>
                Cardio AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30">
                Clinical Intelligence
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
            {[
              { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
              { id: 'predictor', label: 'AI Predictor', icon: BrainCircuit },
              { id: 'history', label: 'Records Log', icon: History },
              { id: 'models', label: 'Model Benchmarks', icon: BarChart3 },
              { id: 'calculator', label: 'Health Hub', icon: Calculator },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                      : isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* System Control & Theme Toggle */}
          <div className="flex items-center gap-3">
            <div className={`hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border font-semibold ${
              apiConnected 
                ? isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <span>{apiConnected ? 'Flask ML Live' : 'Client AI Mode'}</span>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-all shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-800' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
              title="Toggle Dark/Light Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT ROUTER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 1. OVERVIEW DASHBOARD PAGE */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* HERO BANNER */}
            <div className={`relative overflow-hidden rounded-3xl border p-8 ${t.cardHero}`}>
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> Next-Gen Medical Diagnostic Suite
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Cardiovascular Health Analytics
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed font-normal">
                    Welcome to Cardio AI. Analyze patient biometrics, run real-time machine learning predictions, evaluate model accuracy benchmarks, and manage patient health records.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('predictor')}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-rose-500/30 flex items-center gap-2 transition-all"
                    >
                      <Zap className="w-4 h-4" /> Start New Assessment
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all"
                    >
                      <History className="w-4 h-4 text-slate-400" /> View Patient Logs
                    </button>
                  </div>
                </div>

                {/* STATS METRIC CARDS */}
                <div className="grid grid-cols-2 gap-4 shrink-0 lg:w-80">
                  <div className={`p-4 rounded-2xl border ${t.cardInner} space-y-1`}>
                    <div className={`text-xs ${t.subHeading} font-medium`}>Saved Records</div>
                    <div className={`text-2xl font-extrabold ${t.heading}`}>{patientHistory.length}</div>
                    <div className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Permanent Storage
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${t.cardInner} space-y-1`}>
                    <div className={`text-xs ${t.subHeading} font-medium`}>Model Accuracy</div>
                    <div className="text-2xl font-extrabold text-indigo-500">{modelMetrics.accuracy}%</div>
                    <div className={`text-[11px] ${t.subHeading}`}>{selectedModel}</div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${t.cardInner} space-y-1`}>
                    <div className={`text-xs ${t.subHeading} font-medium`}>Top Classifier</div>
                    <div className="text-xl font-extrabold text-rose-500 truncate">{bestModelName}</div>
                    <div className="text-[11px] text-rose-500 font-semibold">Active Selection</div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${t.cardInner} space-y-1`}>
                    <div className={`text-xs ${t.subHeading} font-medium`}>Avg Latency</div>
                    <div className="text-2xl font-extrabold text-emerald-500">12ms</div>
                    <div className="text-[11px] text-emerald-500 font-semibold">Real-time AI</div>
                  </div>
                </div>
              </div>
            </div>

            {/* TWO COLUMN SUMMARY SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Recent Patient Logs Widget (8 COLS) */}
              <div className={`lg:col-span-8 p-6 rounded-3xl border ${t.card} space-y-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-rose-500" />
                    <h3 className={`text-base font-extrabold ${t.heading}`}>Recent Clinical Assessments</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-rose-500 font-bold hover:underline flex items-center gap-1"
                  >
                    View All Logs ({patientHistory.length}) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {patientHistory.slice(0, 4).map((record) => (
                    <div key={record.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-800'}`}>
                          {record.name.charAt(0)}
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${t.heading}`}>{record.name}</div>
                          <div className={`text-xs ${t.subHeading}`}>
                            {record.age} yrs • BP: {record.ap_hi}/{record.ap_lo} mmHg
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                          record.level === 'High Risk' 
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40' 
                            : record.level === 'Moderate Risk'
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {record.score}% Risk
                        </span>
                        <button
                          onClick={() => setSelectedRecordModal(record)}
                          className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick AI Presets Widget (4 COLS) */}
              <div className={`lg:col-span-4 p-6 rounded-3xl border ${t.card} space-y-4`}>
                <h3 className={`text-base font-extrabold ${t.heading} flex items-center gap-2`}>
                  <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
                  Quick Clinical Profiles
                </h3>
                <p className={`text-xs ${t.subHeading}`}>
                  Select a pre-configured profile to populate patient biometrics immediately.
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    { key: 'NORMAL', title: 'Healthy Adult (Normal)', badge: 'Low Risk', border: 'border-emerald-500/40' },
                    { key: 'MEDIUM_RISK', title: 'Middle-Aged (Moderate)', badge: 'Moderate Risk', border: 'border-amber-500/40' },
                    { key: 'HIGH_RISK', title: 'Hypertensive Senior', badge: 'High Risk', border: 'border-rose-500/40' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setFormData(PRESETS[item.key]);
                        setPatientName(PRESETS[item.key].name);
                        setTouched({ age: true, height: true, weight: true, ap_hi: true, ap_lo: true });
                        setActiveTab('predictor');
                        showToast(`Loaded ${item.title} profile`);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border ${t.cardInner} hover:border-rose-500 transition-all flex items-center justify-between shadow-sm`}
                    >
                      <div>
                        <div className={`text-xs font-bold ${t.heading}`}>{item.title}</div>
                        <div className={`text-[11px] ${t.subHeading}`}>BP: {PRESETS[item.key].ap_hi}/{PRESETS[item.key].ap_lo} • Age: {PRESETS[item.key].age}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. AI PREDICTOR ASSESSMENT PAGE */}
        {activeTab === 'predictor' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Action Bar */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border ${t.card}`}>
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-rose-500" />
                <div>
                  <span className={`text-xs ${t.subHeading} uppercase tracking-wider font-bold`}>Patient Name:</span>
                  <input
                    type="text"
                    placeholder="Enter Patient Name..."
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className={`ml-2 rounded-xl px-3 py-1 text-xs font-bold focus:outline-none ${t.input}`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={saveCurrentAssessment}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${t.buttonSecondary}`}
                >
                  <Plus className="w-4 h-4 text-emerald-500" /> Save Record Log
                </button>
                <button
                  onClick={() => window.print()}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${t.buttonSecondary}`}
                  title="Print Clinical Summary"
                >
                  <Printer className="w-4 h-4 text-indigo-500" /> Print Report
                </button>
              </div>
            </div>

            {/* GLOBAL VALIDATION ERROR BANNER (ONBLUR / SUBMIT ERROR) */}
            {hasErrors && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-300 flex items-center gap-3 text-xs font-bold shadow-md">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>
                  Validation Alert: Please correct out-of-range input values before running assessment.
                </span>
              </div>
            )}

            {/* DASHBOARD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* FORM INPUT PANEL (LEFT 7 COLS) */}
              <div className="lg:col-span-7 space-y-6">
                <div className={`p-6 rounded-3xl border ${t.card} space-y-6`}>
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-rose-500" />
                      <h2 className={`text-lg font-extrabold ${t.heading}`}>Clinical Biometrics</h2>
                    </div>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${bpCategory.color} ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
                      BP: {bpCategory.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Typed Age Input (Error triggers ONLY on UNFOCUS / onBlur) */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className={`text-xs font-bold ${t.subHeading} uppercase tracking-wider`}>
                          Age (Years) <span className="text-[10px] text-slate-400">(18 - 100)</span>
                        </label>
                      </div>
                      <input
                        type="number"
                        name="age"
                        placeholder="e.g. 45"
                        value={formData.age}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold focus:outline-none transition-all ${
                          touched.age && validationErrors.age ? t.inputError : t.input
                        }`}
                      />
                      {touched.age && validationErrors.age && (
                        <p className="mt-1 text-[11px] text-rose-500 font-bold flex items-center gap-1 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.age}
                        </p>
                      )}
                    </div>

                    {/* Gender Selection */}
                    <div>
                      <label className={`block text-xs font-bold ${t.subHeading} uppercase tracking-wider mb-2`}>
                        Biological Gender
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { val: 1, label: 'Female' },
                          { val: 2, label: 'Male' }
                        ].map((g) => (
                          <button
                            key={g.val}
                            type="button"
                            onClick={() => setFormData({ ...formData, gender: g.val })}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                              formData.gender === g.val 
                                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20' 
                                : isDarkMode ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Typed Height Input (Error triggers ONLY on UNFOCUS / onBlur) */}
                    <div>
                      <label className={`block text-xs font-bold ${t.subHeading} uppercase tracking-wider mb-1`}>
                        Height (cm) <span className="text-[10px] text-slate-400">(50 - 250)</span>
                      </label>
                      <input
                        type="number"
                        name="height"
                        placeholder="e.g. 175"
                        value={formData.height}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold focus:outline-none transition-all ${
                          touched.height && validationErrors.height ? t.inputError : t.input
                        }`}
                      />
                      {touched.height && validationErrors.height && (
                        <p className="mt-1 text-[11px] text-rose-500 font-bold flex items-center gap-1 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.height}
                        </p>
                      )}
                    </div>

                    {/* Typed Weight Input (Error triggers ONLY on UNFOCUS / onBlur) */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className={`text-xs font-bold ${t.subHeading} uppercase tracking-wider`}>
                          Weight (kg) <span className="text-[10px] text-slate-400">(20 - 250)</span>
                        </label>
                        <span className="text-xs text-indigo-500 font-bold">BMI: {bmi}</span>
                      </div>
                      <input
                        type="number"
                        name="weight"
                        placeholder="e.g. 75"
                        value={formData.weight}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold focus:outline-none transition-all ${
                          touched.weight && validationErrors.weight ? t.inputError : t.input
                        }`}
                      />
                      {touched.weight && validationErrors.weight && (
                        <p className="mt-1 text-[11px] text-rose-500 font-bold flex items-center gap-1 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.weight}
                        </p>
                      )}
                    </div>

                    {/* Typed Systolic BP Input (Error triggers ONLY on UNFOCUS / onBlur) */}
                    <div>
                      <label className={`block text-xs font-bold ${t.subHeading} uppercase tracking-wider mb-1`}>
                        Systolic BP (ap_hi) <span className="text-[10px] text-slate-400">(70 - 240 mmHg)</span>
                      </label>
                      <input
                        type="number"
                        name="ap_hi"
                        placeholder="e.g. 120"
                        value={formData.ap_hi}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold focus:outline-none transition-all ${
                          touched.ap_hi && validationErrors.ap_hi ? t.inputError : t.input
                        }`}
                      />
                      {touched.ap_hi && validationErrors.ap_hi && (
                        <p className="mt-1 text-[11px] text-rose-500 font-bold flex items-center gap-1 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.ap_hi}
                        </p>
                      )}
                    </div>

                    {/* Typed Diastolic BP Input (Error triggers ONLY on UNFOCUS / onBlur) */}
                    <div>
                      <label className={`block text-xs font-bold ${t.subHeading} uppercase tracking-wider mb-1`}>
                        Diastolic BP (ap_lo) <span className="text-[10px] text-slate-400">(40 - 160 mmHg)</span>
                      </label>
                      <input
                        type="number"
                        name="ap_lo"
                        placeholder="e.g. 80"
                        value={formData.ap_lo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold focus:outline-none transition-all ${
                          touched.ap_lo && validationErrors.ap_lo ? t.inputError : t.input
                        }`}
                      />
                      {touched.ap_lo && validationErrors.ap_lo && (
                        <p className="mt-1 text-[11px] text-rose-500 font-bold flex items-center gap-1 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.ap_lo}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SELECTORS (Cholesterol & Glucose) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div>
                      <label className={`block text-xs font-bold ${t.subHeading} uppercase tracking-wider mb-2`}>
                        Cholesterol Level
                      </label>
                      <select
                        name="cholesterol"
                        value={formData.cholesterol}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none ${t.input}`}
                      >
                        <option value={1}>1 - Normal (&lt; 200 mg/dL)</option>
                        <option value={2}>2 - Above Normal (200 - 239 mg/dL)</option>
                        <option value={3}>3 - High (&ge; 240 mg/dL)</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold ${t.subHeading} uppercase tracking-wider mb-2`}>
                        Glucose Level
                      </label>
                      <select
                        name="gluc"
                        value={formData.gluc}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none ${t.input}`}
                      >
                        <option value={1}>1 - Normal (&lt; 100 mg/dL)</option>
                        <option value={2}>2 - Above Normal (100 - 125 mg/dL)</option>
                        <option value={3}>3 - High (&ge; 126 mg/dL)</option>
                      </select>
                    </div>
                  </div>

                  {/* LIFESTYLE MARKERS WITH EXPLICIT YES / NO TICK INDICATORS */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <label className={`block text-xs font-bold ${t.subHeading} uppercase tracking-wider`}>
                      Lifestyle Markers (Clear Yes / No Selection)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { key: 'smoke', label: 'Smoker', icon: Cigarette },
                        { key: 'alco', label: 'Alcohol Intake', icon: Wine },
                        { key: 'active', label: 'Physical Activity', icon: Dumbbell }
                      ].map((item) => {
                        const Icon = item.icon;
                        const isYes = formData[item.key] === 1;
                        return (
                          <div 
                            key={item.key}
                            className={`p-3 rounded-2xl border flex flex-col justify-between gap-2.5 transition-all ${
                              isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-bold">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-indigo-400" />
                                <span className={t.heading}>{item.label}</span>
                              </div>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                isYes
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                {isYes ? '✓ YES' : '✗ NO'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, [item.key]: 1 })}
                                className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                                  isYes
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30'
                                    : isDarkMode ? 'bg-slate-900 text-slate-400 hover:text-slate-200' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-300'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" /> Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, [item.key]: 0 })}
                                className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                                  !isYes
                                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-500/30'
                                    : isDarkMode ? 'bg-slate-900 text-slate-400 hover:text-slate-200' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-300'
                                }`}
                              >
                                <X className="w-3.5 h-3.5" /> No
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* MODEL SELECTOR DROPDOWN & SUBMIT */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-auto flex-1">
                      <label className={`block text-xs font-bold ${t.subHeading} uppercase tracking-wider mb-1`}>
                        Selected Machine Learning Model
                      </label>
                      <select
                        value={selectedModel}
                        onChange={(e) => {
                          const newModel = e.target.value;
                          setSelectedModel(newModel);
                          const found = availableModels.find(m => m.name === newModel);
                          if (found) {
                            setModelMetrics({
                              accuracy: found.accuracy,
                              precision: found.precision,
                              recall: found.recall,
                              f1: found.f1
                            });
                          }
                          showToast(`Selected model: ${newModel}`);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-sm font-bold focus:outline-none ${t.input}`}
                      >
                        {availableModels.map((m) => (
                          <option key={m.name} value={m.name}>
                            {m.name} {m.is_best ? '⭐ (73.01% Acc)' : `(${m.accuracy}% Acc)`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-auto flex items-end">
                      <button
                        onClick={() => {
                          setTouched({ age: true, height: true, weight: true, ap_hi: true, ap_lo: true });
                          fetchPredictionFromBackend(formData, selectedModel);
                        }}
                        disabled={hasErrors || isFormEmpty || isCalculating}
                        className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                          hasErrors || isFormEmpty
                            ? 'bg-slate-400 dark:bg-slate-800 text-slate-200 cursor-not-allowed border border-slate-300 opacity-60' 
                            : 'bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white shadow-lg shadow-rose-500/30'
                        }`}
                      >
                        {isCalculating ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Computing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" /> Run Assessment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RISK SCORE & ANALYTICS PANEL (RIGHT 5 COLS) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* PRIMARY RISK SCORE GAUGE CARD */}
                <div className={`p-6 rounded-3xl border ${riskInfo.bg} shadow-2xl relative overflow-hidden space-y-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className={`w-5 h-5 ${riskInfo.color}`} />
                      <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Cardiovascular Probability
                      </h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${riskInfo.badge}`}>
                      {riskInfo.level}
                    </span>
                  </div>

                  {/* SCORE DISPLAY */}
                  <div className="text-center py-4 space-y-2">
                    <div className="relative inline-flex items-center justify-center">
                      <span className={`text-6xl md:text-7xl font-extrabold tracking-tight ${riskInfo.color}`}>
                        {!hasCalculated || isFormEmpty || hasErrors ? '--' : `${riskScore.toFixed(1)}%`}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm font-semibold max-w-xs mx-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {riskInfo.desc}
                    </p>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="space-y-1.5">
                    <div className={`flex justify-between text-[11px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>0% Safe</span>
                      <span>50% Moderate</span>
                      <span>100% High Risk</span>
                    </div>
                    <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${riskInfo.bar}`}
                        style={{ width: `${!hasCalculated || isFormEmpty || hasErrors ? 0 : Math.min(Math.max(riskScore, 5), 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* METRICS GRID - DYNAMICALLY UPDATED PER SELECTED MODEL */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Model Metric Benchmarks:</span>
                      <span className="text-rose-500 font-extrabold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        {selectedModel}
                      </span>
                    </div>
                    <div className={`pt-2 grid grid-cols-4 gap-2 text-center transition-all duration-300 ${
                      metricHighlight ? 'scale-105 ring-2 ring-rose-500/50 rounded-2xl' : ''
                    }`}>
                      {[
                        { label: 'Accuracy', val: `${modelMetrics.accuracy}%` },
                        { label: 'Precision', val: `${modelMetrics.precision}%` },
                        { label: 'Recall', val: `${modelMetrics.recall}%` },
                        { label: 'F1-Score', val: `${modelMetrics.f1}%` }
                      ].map((m) => (
                        <div key={m.label} className={`p-2 rounded-xl border transition-all ${
                          metricHighlight ? 'bg-rose-500/20 border-rose-500' : t.cardInner
                        }`}>
                          <div className={`text-[10px] font-bold ${t.subHeading}`}>{m.label}</div>
                          <div className={`text-xs font-extrabold ${t.heading} mt-0.5`}>{m.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* CLINICAL ACTIONS */}
                <div className={`p-6 rounded-3xl border ${t.card} space-y-4`}>
                  <h3 className={`text-xs font-extrabold ${t.heading} uppercase tracking-wider flex items-center gap-2`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Targeted Health Guidance
                  </h3>

                  <ul className="space-y-2.5 text-xs font-medium">
                    {Number(formData.ap_hi) > 135 && (
                      <li className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>High BP ({formData.ap_hi} mmHg): Monitor sodium intake and consult a physician.</span>
                      </li>
                    )}
                    {formData.cholesterol > 1 && (
                      <li className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300">
                        <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>Elevated Lipid Markers: Low saturated-fat diet recommended.</span>
                      </li>
                    )}
                    {formData.active === 0 && (
                      <li className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-800 dark:text-indigo-300">
                        <Dumbbell className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span>Inactivity Flagged: Target 150 mins weekly of moderate physical exercise.</span>
                      </li>
                    )}
                    <li className={`flex items-start gap-2.5 p-3 rounded-xl border ${t.cardInner} ${t.heading}`}>
                      <UserCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>BMI: {bmi} kg/m² • Annual lipid panel & ECG recommended.</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 3. PATIENT HISTORY & RECORDS LOG PAGE */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className={`text-2xl font-extrabold ${t.heading} flex items-center gap-2`}>
                  <History className="w-6 h-6 text-rose-500" /> Patient Assessment Log
                </h2>
                <p className={`text-sm ${t.subHeading} mt-1`}>
                  Manage saved cardiovascular diagnostic reports (permanently saved in browser storage).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + ["ID,Name,Date,Age,BP,Score,Level,Model", ...patientHistory.map(e => `${e.id},${e.name},${e.date},${e.age},${e.ap_hi}/${e.ap_lo},${e.score}%,${e.level},${e.model}`)].join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "patient_cardio_records.csv");
                    document.body.appendChild(link);
                    link.click();
                    showToast('Exported CSV record log!');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${t.buttonSecondary}`}
                >
                  <Download className="w-4 h-4 text-indigo-500" /> Export CSV
                </button>
              </div>
            </div>

            {/* FILTER & SEARCH BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search patient name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm font-semibold focus:outline-none ${t.input}`}
                />
              </div>

              <div className="sm:col-span-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs font-bold focus:outline-none ${t.input}`}
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="HIGH">High Risk Only</option>
                  <option value="MODERATE">Moderate Risk Only</option>
                  <option value="LOW">Low Risk Only</option>
                </select>
              </div>
            </div>

            {/* PATIENTS TABLE */}
            <div className={`overflow-x-auto rounded-3xl border ${t.card}`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xs font-bold uppercase tracking-wider ${t.tableHeader}`}>
                    <th className="py-4 px-6">Record ID</th>
                    <th className="py-4 px-6">Patient Name</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Blood Pressure</th>
                    <th className="py-4 px-6">Risk Score</th>
                    <th className="py-4 px-6">Model Used</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-sm">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={`py-8 text-center ${t.subHeading} text-xs`}>
                        No patient records found matching search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item) => (
                      <tr key={item.id} className={`transition-colors ${t.tableRow}`}>
                        <td className="py-4 px-6 font-mono text-xs text-rose-500 font-bold">{item.id}</td>
                        <td className={`py-4 px-6 font-extrabold ${t.heading}`}>{item.name}</td>
                        <td className={`py-4 px-6 ${t.subHeading} text-xs`}>{item.date}</td>
                        <td className={`py-4 px-6 ${t.heading} text-xs font-semibold`}>{item.ap_hi}/{item.ap_lo} mmHg</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            item.level === 'High Risk'
                              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                              : item.level === 'Moderate Risk'
                              ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {item.score}% ({item.level})
                          </span>
                        </td>
                        <td className={`py-4 px-6 ${t.subHeading} text-xs`}>{item.model}</td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => setSelectedRecordModal(item)}
                            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
                            title="View Record Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const updated = patientHistory.filter(h => h.id !== item.id);
                              setPatientHistory(updated);
                              showToast(`Deleted record ${item.id}`);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-500 hover:text-rose-600 hover:bg-slate-200'}`}
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. MODEL BENCHMARKS TAB */}
        {activeTab === 'models' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className={`text-2xl font-extrabold ${t.heading} flex items-center gap-2`}>
                  <BarChart3 className="w-6 h-6 text-indigo-500" /> Model Evaluation Leaderboard
                </h2>
                <p className={`text-sm ${t.subHeading} mt-1`}>
                  Comparative performance benchmarks across machine learning classifiers.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Top Classifier: {bestModelName}
              </div>
            </div>

            <div className={`overflow-x-auto rounded-3xl border ${t.card}`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xs font-bold uppercase tracking-wider ${t.tableHeader}`}>
                    <th className="py-4 px-6">Algorithm Model</th>
                    <th className="py-4 px-6">Accuracy</th>
                    <th className="py-4 px-6">Precision</th>
                    <th className="py-4 px-6">Recall</th>
                    <th className="py-4 px-6">F1-Score</th>
                    <th className="py-4 px-6">Inference Speed</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-sm">
                  {availableModels.map((m) => {
                    const isSelected = selectedModel === m.name;
                    return (
                      <tr 
                        key={m.name} 
                        className={`transition-colors ${
                          isSelected ? 'bg-rose-500/10' : t.tableRow
                        }`}
                      >
                        <td className={`py-4 px-6 font-extrabold ${t.heading} flex items-center gap-2`}>
                          {m.name}
                          {m.is_best && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                              BEST
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400 font-extrabold">{m.accuracy}%</td>
                        <td className={`py-4 px-6 ${t.heading}`}>{m.precision}%</td>
                        <td className={`py-4 px-6 ${t.heading}`}>{m.recall}%</td>
                        <td className="py-4 px-6 text-indigo-600 dark:text-indigo-400 font-bold">{m.f1}%</td>
                        <td className={`py-4 px-6 ${t.subHeading} text-xs font-mono`}>{m.speed}</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              setSelectedModel(m.name);
                              setActiveTab('predictor');
                              showToast(`Switched active model to ${m.name}`);
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isSelected 
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' 
                                : t.buttonSecondary
                            }`}
                          >
                            {isSelected ? 'Active Model' : 'Select Model'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. HEALTH HUB & CALCULATOR TAB */}
        {activeTab === 'calculator' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className={`text-2xl font-extrabold ${t.heading} flex items-center gap-2`}>
                <Calculator className="w-6 h-6 text-cyan-500" /> Health & Biometric Calculator Hub
              </h2>
              <p className={`text-sm ${t.subHeading} mt-1`}>
                Calculate vital cardiovascular metrics and review clinical reference guidelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* BMI Card */}
              <div className={`p-6 rounded-3xl border ${t.card} space-y-3`}>
                <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
                  <Scale className="w-5 h-5" /> Body Mass Index (BMI)
                </div>
                <div className={`text-3xl font-extrabold ${t.heading}`}>{bmi} <span className={`text-xs ${t.subHeading} font-normal`}>kg/m²</span></div>
                <p className={`text-xs ${t.subHeading} font-medium`}>
                  {!formData.weight || !formData.height ? 'Enter Height & Weight' : Number(bmi) < 18.5 ? 'Underweight' : Number(bmi) < 25 ? 'Normal Weight' : Number(bmi) < 30 ? 'Overweight' : 'Obesity'}
                </p>
              </div>

              {/* MAP Card */}
              <div className={`p-6 rounded-3xl border ${t.card} space-y-3`}>
                <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                  <Activity className="w-5 h-5" /> Mean Arterial Pressure (MAP)
                </div>
                <div className={`text-3xl font-extrabold ${t.heading}`}>
                  {!formData.ap_hi || !formData.ap_lo ? '0.0' : (((2 * Number(formData.ap_lo)) + Number(formData.ap_hi)) / 3).toFixed(1)} <span className={`text-xs ${t.subHeading} font-normal`}>mmHg</span>
                </div>
                <p className={`text-xs ${t.subHeading} font-medium`}>Target range: 70 - 100 mmHg for organ perfusion.</p>
              </div>

              {/* Pulse Pressure Card */}
              <div className={`p-6 rounded-3xl border ${t.card} space-y-3`}>
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                  <Heart className="w-5 h-5" /> Pulse Pressure
                </div>
                <div className={`text-3xl font-extrabold ${t.heading}`}>
                  {!formData.ap_hi || !formData.ap_lo ? '0' : Number(formData.ap_hi) - Number(formData.ap_lo)} <span className={`text-xs ${t.subHeading} font-normal`}>mmHg</span>
                </div>
                <p className={`text-xs ${t.subHeading} font-medium`}>Normal range: 40 - 60 mmHg. High values indicate arterial stiffness.</p>
              </div>

            </div>

            {/* Encyclopedia / Reference Guide */}
            <div className={`p-8 rounded-3xl border ${t.card} space-y-6`}>
              <h3 className={`text-lg font-extrabold ${t.heading} flex items-center gap-2`}>
                <BookOpen className="w-5 h-5 text-amber-500" /> Cardiovascular Reference Standards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className={`p-4 rounded-2xl border ${t.cardInner} space-y-2`}>
                  <div className={`font-bold ${t.heading} text-sm`}>Blood Pressure Categories (AHA/ACC)</div>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 font-medium">
                    <li>• <span className="text-emerald-600 dark:text-emerald-400 font-bold">Normal:</span> Systolic &lt; 120 and Diastolic &lt; 80</li>
                    <li>• <span className="text-amber-600 dark:text-amber-300 font-bold">Elevated:</span> Systolic 120-129 and Diastolic &lt; 80</li>
                    <li>• <span className="text-amber-700 dark:text-amber-400 font-bold">Stage 1 HTN:</span> Systolic 130-139 or Diastolic 80-89</li>
                    <li>• <span className="text-rose-600 dark:text-rose-400 font-bold">Stage 2 HTN:</span> Systolic &ge; 140 or Diastolic &ge; 90</li>
                  </ul>
                </div>
                <div className={`p-4 rounded-2xl border ${t.cardInner} space-y-2`}>
                  <div className={`font-bold ${t.heading} text-sm`}>Lipid & Glucose Target Reference</div>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 font-medium">
                    <li>• <span className="font-bold">Cholesterol 1:</span> Normal (&lt; 200 mg/dL)</li>
                    <li>• <span className="text-amber-600 dark:text-amber-400 font-bold">Cholesterol 2:</span> Borderline High (200-239 mg/dL)</li>
                    <li>• <span className="text-rose-600 dark:text-rose-400 font-bold">Cholesterol 3:</span> High (&ge; 240 mg/dL)</li>
                    <li>• <span className="text-indigo-600 dark:text-indigo-400 font-bold">Fasting Glucose:</span> Target &lt; 100 mg/dL</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* DETAIL MODAL DIALOG */}
      {selectedRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`relative w-full max-w-md rounded-3xl border p-6 space-y-6 shadow-2xl ${t.card}`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" />
                <h3 className={`text-base font-bold ${t.heading}`}>Clinical Assessment Details</h3>
              </div>
              <button 
                onClick={() => setSelectedRecordModal(null)}
                className={`p-1 rounded-lg ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className={t.subHeading}>Record ID:</span>
                <span className="font-mono text-rose-500 font-bold">{selectedRecordModal.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className={t.subHeading}>Patient Name:</span>
                <span className={t.heading}>{selectedRecordModal.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className={t.subHeading}>Assessment Date:</span>
                <span className={t.heading}>{selectedRecordModal.date}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className={t.subHeading}>Blood Pressure:</span>
                <span className={t.heading}>{selectedRecordModal.ap_hi}/{selectedRecordModal.ap_lo} mmHg</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className={t.subHeading}>Model Evaluator:</span>
                <span className="text-indigo-500 font-bold">{selectedRecordModal.model}</span>
              </div>
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${t.cardInner}`}>
                <div>
                  <div className={`text-[10px] ${t.subHeading} uppercase font-bold`}>Calculated Risk</div>
                  <div className="text-xl font-extrabold text-rose-500">{selectedRecordModal.score}% Risk</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40">
                  {selectedRecordModal.level}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedRecordModal(null);
                  window.print();
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${t.buttonSecondary}`}
              >
                <Printer className="w-4 h-4 text-indigo-500" /> Print Detailed Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}