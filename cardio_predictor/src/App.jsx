import React, { useState, useEffect } from 'react';

const PRESETS = {
  NORMAL: {
    age: 35, gender: 1, height: 168, weight: 62,
    ap_hi: 115, ap_lo: 75, cholesterol: 1, gluc: 1,
    smoke: 0, alco: 0, active: 1
  },
  MEDIUM_RISK: {
    age: 52, gender: 2, height: 175, weight: 88,
    ap_hi: 155, ap_lo: 95, cholesterol: 2, gluc: 2,
    smoke: 1, alco: 0, active: 0
  },
  HIGH_RISK: {
    age: 63, gender: 2, height: 170, weight: 95,
    ap_hi: 170, ap_lo: 105, cholesterol: 3, gluc: 3,
    smoke: 1, alco: 1, active: 0
  }
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [formData, setFormData] = useState(PRESETS.MEDIUM_RISK);

  const [riskScore, setRiskScore] = useState(0);
  const [riskFactors, setRiskFactors] = useState([]);
  const [apiConnected, setApiConnected] = useState(false);

  const fetchPredictionFromBackend = async (dataToSend) => {
    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      const result = await response.json();
      if (result.success) {
        setRiskScore(result.risk_percentage);
        setRiskFactors(result.risk_factors);
        setApiConnected(true);
      }
    } catch (err) {
      setApiConnected(false);
    }
  };

  useEffect(() => {
    fetchPredictionFromBackend(formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = parseFloat(value) || 0;

    setFormData((prev) => {
      let updated = { ...prev, [name]: val };
      if (name === 'ap_lo' && val > prev.ap_hi) updated.ap_hi = val;
      if (name === 'ap_hi' && val < prev.ap_lo) updated.ap_lo = val;
      return updated;
    });
  };

  const heightM = formData.height / 100;
  const bmi = heightM > 0 ? (formData.weight / (heightM * heightM)).toFixed(1) : '0';
  const bmiLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal Weight' : bmi < 30 ? 'Overweight' : 'Obese';
  const bpLabel = formData.ap_hi >= 140 || formData.ap_lo >= 90 ? 'High Blood Pressure (Stage 2)' : formData.ap_hi >= 130 || formData.ap_lo >= 80 ? 'High Blood Pressure (Stage 1)' : 'Normal BP';

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8fafc',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    border: isDarkMode ? '#334155' : '#cbd5e1',
    textPrimary: isDarkMode ? '#f8fafc' : '#0f172a',
    textMuted: isDarkMode ? '#94a3b8' : '#64748b',
    inputBg: isDarkMode ? '#0f172a' : '#f1f5f9',
    inputBorder: isDarkMode ? '#334155' : '#cbd5e1',
    btnBg: isDarkMode ? '#f8fafc' : '#0f172a',
    btnText: isDarkMode ? '#0f172a' : '#ffffff',
  };

  return (
    <div style={{ ...styles.page, backgroundColor: theme.bg, color: theme.textPrimary }}>
      
      <style>{`
        @media print {
          body { background-color: #ffffff !important; color: #000000 !important; }
          .no-print { display: none !important; }
          .print-card { background-color: #ffffff !important; border: 1px solid #000000 !important; color: #000000 !important; box-shadow: none !important; }
          .print-text { color: #000000 !important; }
        }
      `}</style>

      <div style={styles.container}>
        
        <div style={{ ...styles.studentHeader, borderColor: theme.border }}>
          <div>
            <h3 style={styles.studentTitle}>Heart Disease Prediction System</h3>
            <p style={{ ...styles.studentSub, color: theme.textMuted }}>
              Student Project 
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          
            <button
              className="no-print"
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{ ...styles.themeToggle, backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textPrimary }}
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>

=        <div className="no-print" style={styles.presetBar}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: theme.textMuted }}>Test Samples:</span>
          <button style={{ ...styles.sampleBtn, backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textPrimary }} onClick={() => setFormData(PRESETS.NORMAL)}>Healthy Sample</button>
          <button style={{ ...styles.sampleBtn, backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textPrimary }} onClick={() => setFormData(PRESETS.MEDIUM_RISK)}>Medium Risk</button>
          <button style={{ ...styles.sampleBtn, backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.textPrimary }} onClick={() => setFormData(PRESETS.HIGH_RISK)}>High Risk</button>
        </div>

        <div style={styles.grid}>
          
          <div className="print-card" style={{ ...styles.card, backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <h3 className="print-text" style={{ ...styles.cardHeading, color: theme.textPrimary }}>Patient Input Form</h3>

            <div style={styles.formGrid}>
              
              <div style={styles.sliderBox}>
                <div style={styles.sliderHeader}>
                  <label className="print-text" style={{ ...styles.label, color: theme.textMuted }}>Age</label>
                  <span style={{ ...styles.valueTag, color: theme.textPrimary }}>{formData.age} Years</span>
                </div>
                <input type="range" name="age" min="0" max="100" value={formData.age} onChange={handleChange} style={styles.rangeInput} />
              </div>

              <div style={styles.inputGroup}>
                <label className="print-text" style={{ ...styles.label, color: theme.textMuted }}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} style={{ ...styles.select, backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}>
                  <option value={1}>Female</option>
                  <option value={2}>Male</option>
                </select>
              </div>

              <div style={styles.sliderBox}>
                <div style={styles.sliderHeader}>
                  <label className="print-text" style={{ ...styles.label, color: theme.textMuted }}>Height</label>
                  <span style={{ ...styles.valueTag, color: theme.textPrimary }}>{formData.height} cm</span>
                </div>
                <input type="range" name="height" min="100" max="220" value={formData.height} onChange={handleChange} style={styles.rangeInput} />
              </div>

              <div style={styles.sliderBox}>
                <div style={styles.sliderHeader}>
                  <label className="print-text" style={{ ...styles.label, color: theme.textMuted }}>Weight</label>
                  <span style={{ ...styles.valueTag, color: theme.textPrimary }}>{formData.weight} kg</span>
                </div>
                <input type="range" name="weight" min="30" max="200" value={formData.weight} onChange={handleChange} style={styles.rangeInput} />
              </div>

              <div style={styles.sliderBox}>
                <div style={styles.sliderHeader}>
                  <label className="print-text" style={{ ...styles.label, color: theme.textMuted }}>Lower BP (ap_lo)</label>
                  <span style={{ ...styles.valueTag, color: theme.textPrimary }}>{formData.ap_lo} mmHg</span>
                </div>
                <input type="range" name="ap_lo" min="40" max="140" value={formData.ap_lo} onChange={handleChange} style={styles.rangeInput} />
              </div>

              {/* Systolic (ap_hi) */}
              <div style={styles.sliderBox}>
                <div style={styles.sliderHeader}>
                  <label className="print-text" style={{ ...styles.label, color: theme.textMuted }}>Upper BP (ap_hi)</label>
                  <span style={{ ...styles.valueTag, color: theme.textPrimary }}>{formData.ap_hi} mmHg</span>
                </div>
                <input type="range" name="ap_hi" min={formData.ap_lo} max="220" value={formData.ap_hi} onChange={handleChange} style={styles.rangeInput} />
              </div>

              <div style={styles.inputGroup}>
                <label className="print-text" style={{ ...styles.label, color: theme.textMuted }}>Cholesterol</label>
                <select name="cholesterol" value={formData.cholesterol} onChange={handleChange} style={{ ...styles.select, backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}>
                  <option value={1}>1: Normal</option>
                  <option value={2}>2: Above Normal</option>
                  <option value={3}>3: High</option>
                </select>
              </div>

              {/* Glucose */}
              <div style={styles.inputGroup}>
                <label className="print-text" style={{ ...styles.label, color: theme.textMuted }}>Glucose</label>
                <select name="gluc" value={formData.gluc} onChange={handleChange} style={{ ...styles.select, backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}>
                  <option value={1}>1: Normal</option>
                  <option value={2}>2: Above Normal</option>
                  <option value={3}>3: High</option>
                </select>
              </div>

              {/* Smoking */}
              <div style={styles.inputGroup}>
                <label className="print-text" style={{ ...styles.label, color: theme.textMuted }}>Smoking</label>
                <select name="smoke" value={formData.smoke} onChange={handleChange} style={{ ...styles.select, backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}>
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>

              {/* Alcohol */}
              <div style={styles.inputGroup}>
                <label className="print-text" style={{ ...styles.label, color: theme.textMuted }}>Alcohol</label>
                <select name="alco" value={formData.alco} onChange={handleChange} style={{ ...styles.select, backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}>
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>

              <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                <label className="print-text" style={{ ...styles.label, color: theme.textMuted }}>Physical Activity</label>
                <select name="active" value={formData.active} onChange={handleChange} style={{ ...styles.select, backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}>
                  <option value={1}>Active</option>
                  <option value={0}>Not Active</option>
                </select>
              </div>

            </div>

            <div style={{ ...styles.extraInfo, borderColor: theme.border }}>
              <div style={styles.infoRow}>
                <span style={{ color: theme.textMuted }}>Calculated BMI:</span>
                <span className="print-text" style={{ fontWeight: 'bold', color: theme.textPrimary }}>{bmi} kg/m² ({bmiLabel})</span>
              </div>
              <div style={styles.infoRow}>
                <span style={{ color: theme.textMuted }}>Blood Pressure Condition:</span>
                <span className="print-text" style={{ fontWeight: 'bold', color: theme.textPrimary }}>{bpLabel}</span>
              </div>
            </div>

          </div>

          {/* Result Output */}
          <div style={styles.rightColumn}>
            
            <div className="print-card" style={{ ...styles.card, backgroundColor: theme.cardBg, borderColor: theme.border }}>
              <div style={styles.resultHeader}>
                <h3 className="print-text" style={{ ...styles.cardHeading, color: theme.textPrimary }}>Prediction Output (Flask)</h3>
                <span style={{ ...styles.statusBadge, backgroundColor: riskScore >= 50 ? '#ef4444' : '#10b981' }}>
                  {riskScore >= 50 ? 'POSITIVE (High Risk)' : 'NEGATIVE (Low Risk)'}
                </span>
              </div>

              <div style={styles.scoreContainer}>
                <span className="print-text" style={{ ...styles.scoreText, color: theme.textPrimary }}>
                  {riskScore}%
                </span>
                <span style={{ fontSize: '13px', color: theme.textMuted }}>Heart Disease Chance</span>
              </div>

              <div style={{ ...styles.meterTrack, backgroundColor: theme.inputBg }}>
                <div style={{ ...styles.meterFill, width: `${Math.min(100, Math.max(0, riskScore))}%`, backgroundColor: riskScore >= 50 ? '#ef4444' : '#10b981' }} />
              </div>

              <button className="no-print" style={{ ...styles.pdfBtn, backgroundColor: theme.btnBg, color: theme.btnText }} onClick={() => window.print()}>
                🖨️ Download PDF Report
              </button>
            </div>

            <div className="print-card" style={{ ...styles.card, backgroundColor: theme.cardBg, borderColor: theme.border }}>
              <h4 className="print-text" style={{ ...styles.cardHeading, color: theme.textPrimary, marginBottom: '12px' }}>Main Contributing Factors</h4>
              {riskFactors.length > 0 ? (
                <div style={styles.factorList}>
                  {riskFactors.map((item, index) => (
                    <div key={index} className="print-text" style={{ ...styles.factorItem, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }}>
                      • {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0 }}>No major risk factors found.</p>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px 16px', boxSizing: 'border-box' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  studentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', paddingBottom: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' },
  studentTitle: { fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0' },
  studentSub: { fontSize: '13px', margin: 0 },
  themeToggle: { padding: '8px 14px', borderRadius: '8px', border: '1px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  presetBar: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  sampleBtn: { padding: '6px 12px', borderRadius: '6px', border: '1px solid', fontSize: '12px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' },
  rightColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { border: '1px solid', borderRadius: '16px', padding: '20px' },
  cardHeading: { fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' },
  sliderBox: { display: 'flex', flexDirection: 'column', gap: '4px' },
  sliderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  valueTag: { fontSize: '12px', fontWeight: 'bold' },
  rangeInput: { width: '100%', cursor: 'pointer', accentColor: '#3b82f6' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' },
  select: { padding: '8px 10px', borderRadius: '8px', border: '1px solid', fontSize: '14px', outline: 'none' },
  extraInfo: { borderTop: '1px solid', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' },
  infoRow: { display: 'flex', justifyContent: 'space-between' },
  resultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  statusBadge: { color: '#ffffff', fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px' },
  scoreContainer: { textAlign: 'center', margin: '16px 0' },
  scoreText: { fontSize: '48px', fontWeight: '900', display: 'block', lineHeight: '1' },
  meterTrack: { height: '10px', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' },
  meterFill: { height: '100%', transition: 'width 0.3s ease' },
  pdfBtn: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' },
  factorList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  factorItem: { padding: '8px 12px', borderRadius: '8px', border: '1px solid', fontSize: '12px' },
};