import { forwardRef } from 'react';

/**
 * MarksheetCard — A styled marksheet component designed to be captured by html2canvas.
 * Props:
 *   candidate: { name, roll_number, registration_no, exam_name, test_date, test_time, subject }
 *   score: { total_marks, correct, wrong, unattempted, max_marks }
 *   rank: { rank, total_appeared, percentile }
 */
const MarksheetCard = forwardRef(function MarksheetCard({ candidate, score, rank }, ref) {
  const accuracy = score?.correct && (score.correct + score.wrong + score.unattempted)
    ? Math.round((score.correct / (score.correct + score.wrong + score.unattempted)) * 100)
    : 0;

  return (
    <div
      ref={ref}
      style={{
        width: '800px',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        color: '#ffffff',
        padding: '0',
        borderRadius: '16px',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        padding: '24px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>⚡ RankVeda</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>Official Score Card</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>Download Date</div>
          <div style={{ fontSize: '13px', fontWeight: '600' }}>{new Date().toLocaleDateString('hi-IN')}</div>
        </div>
      </div>

      {/* Candidate Info */}
      <div style={{ padding: '28px 36px 0' }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: '#a78bfa' }}>
            {candidate?.name || 'Candidate Name'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '13px' }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '2px' }}>ROLL NUMBER</div>
              <div style={{ fontWeight: '600', fontFamily: 'monospace' }}>{candidate?.roll_number || '—'}</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '2px' }}>REG. NUMBER</div>
              <div style={{ fontWeight: '600', fontFamily: 'monospace' }}>{candidate?.registration_no || '—'}</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '2px' }}>EXAM NAME</div>
              <div style={{ fontWeight: '600' }}>{candidate?.exam_name || '—'}</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '2px' }}>TEST DATE</div>
              <div style={{ fontWeight: '600' }}>{candidate?.test_date || '—'}</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '2px' }}>SHIFT / TIME</div>
              <div style={{ fontWeight: '600' }}>{candidate?.test_time || '—'}</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '2px' }}>SUBJECT</div>
              <div style={{ fontWeight: '600' }}>{candidate?.subject || 'General'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Section */}
      <div style={{ padding: '0 36px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Big Score */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea22, #764ba222)',
          border: '1px solid #667eea44',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px', letterSpacing: '2px' }}>TOTAL SCORE</div>
          <div style={{ fontSize: '52px', fontWeight: '800', color: '#a78bfa', lineHeight: 1 }}>
            {score?.total_marks != null ? Number(score.total_marks).toFixed(2) : '—'}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '6px' }}>
            out of {score?.max_marks || 100}
          </div>
        </div>

        {/* Rank */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b22, #ef444422)',
          border: '1px solid #f59e0b44',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px', letterSpacing: '2px' }}>LIVE RANK</div>
          <div style={{ fontSize: '52px', fontWeight: '800', color: '#fbbf24', lineHeight: 1 }}>
            #{rank?.rank || '—'}
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
            {rank?.total_appeared ? `out of ${rank.total_appeared.toLocaleString()} appeared` : 'Real-time rank'}
          </div>
          {rank?.percentile && (
            <div style={{ fontSize: '12px', color: '#34d399', marginTop: '4px' }}>
              Top {(100 - rank.percentile).toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ padding: '0 36px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
        {[
          { label: 'CORRECT', value: score?.correct ?? '—', color: '#34d399', bg: '#064e3b22' },
          { label: 'WRONG', value: score?.wrong ?? '—', color: '#f87171', bg: '#7f1d1d22' },
          { label: 'SKIPPED', value: score?.unattempted ?? '—', color: '#9ca3af', bg: '#1f293722' },
          { label: 'ACCURACY', value: `${accuracy}%`, color: '#60a5fa', bg: '#1e3a5f22' },
        ].map((s) => (
          <div key={s.label} style={{
            background: s.bg,
            borderRadius: '10px',
            padding: '14px',
            textAlign: 'center',
            border: `1px solid ${s.color}33`,
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', letterSpacing: '1px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '14px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#4b5563',
      }}>
        <div>🔒 Powered by RankVeda.in — Exam Intelligence Platform</div>
        <div>Rank data is real-time and may change</div>
      </div>
    </div>
  );
});

export default MarksheetCard;
