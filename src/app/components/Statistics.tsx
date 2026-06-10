import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';
import { useApp } from '../context';
import { Batch } from '../types';

function durationMs(b: Batch): number {
  if (!b.endTime) return 0;
  return new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
}

function avgMinutes(ms: number): string {
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h > 0) return `${h}h ${r}m`;
  return `${m}m`;
}

const COLORS = ['#F59E0B', '#3B82F6', '#22C55E', '#EF4444', '#A855F7', '#14B8A6'];

export function Statistics() {
  const { batches, cheeseTypes } = useApp();

  const completed = batches.filter(b => b.status === 'completed');
  const cancelled = batches.filter(b => b.status === 'cancelled');
  const active = batches.filter(b => b.status === 'active');
  const total = batches.length;

  const byType = useMemo(() => {
    const map = new Map<string, { name: string; count: number; totalMs: number; delays: number }>();
    completed.forEach(b => {
      const existing = map.get(b.cheeseTypeName) ?? { name: b.cheeseTypeName, count: 0, totalMs: 0, delays: 0 };
      const delays = b.steps.filter(s => s.completed && s.completedAt && new Date(s.completedAt).getTime() > new Date(s.scheduledTime).getTime() + 60000).length;
      map.set(b.cheeseTypeName, {
        name: b.cheeseTypeName,
        count: existing.count + 1,
        totalMs: existing.totalMs + durationMs(b),
        delays: existing.delays + delays,
      });
    });
    return Array.from(map.values());
  }, [completed]);

  const totalDelays = useMemo(() =>
    completed.reduce((acc, b) =>
      acc + b.steps.filter(s => s.completed && s.completedAt && new Date(s.completedAt).getTime() > new Date(s.scheduledTime).getTime() + 60000).length, 0
    ), [completed]);

  const avgDurationMs = completed.length > 0
    ? completed.reduce((acc, b) => acc + durationMs(b), 0) / completed.length
    : 0;

  // Last 7 days bar chart data
  const last7 = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
      const dayStr = d.toISOString().slice(0, 10);
      const count = completed.filter(b => b.endTime?.slice(0, 10) === dayStr).length;
      days.push({ label, count });
    }
    return days;
  }, [completed]);

  const pieData = byType.map((t, i) => ({ name: t.name, value: t.count, color: COLORS[i % COLORS.length] }));

  const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
    <div
      style={{
        background: 'var(--card)',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid var(--border)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '5px' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '18px' }}>Estadísticas</h1>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
        <StatCard label="Total tambos" value={total} />
        <StatCard label="Completados" value={completed.length} />
        <StatCard label="En proceso" value={active.length} />
        <StatCard label="Cancelados" value={cancelled.length} />
        <StatCard
          label="Tiempo promedio"
          value={avgDurationMs ? avgMinutes(avgDurationMs) : '—'}
          sub="por proceso"
        />
        <StatCard
          label="Retrasos totales"
          value={totalDelays}
          sub="pasos fuera de tiempo"
        />
      </div>

      {completed.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'var(--card)',
            borderRadius: '14px',
            border: '1px solid var(--border)',
            color: 'var(--muted-foreground)',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
          <p>Completa algunos tambos para ver estadísticas.</p>
        </div>
      ) : (
        <>
          {/* Weekly bar chart */}
          <div
            style={{
              background: 'var(--card)',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid var(--border)',
              marginBottom: '16px',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
              Producción últimos 7 días
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={last7} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ background: '#1A2634', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F1F5F9' }}
                  cursor={{ fill: 'rgba(245,158,11,0.1)' }}
                />
                <Bar dataKey="count" name="Tambos" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* By type pie + table */}
          {byType.length > 1 && (
            <div
              style={{
                background: 'var(--card)',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid var(--border)',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
                Producción por tipo de queso
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    dataKey="value"
                    label={({ name, percent }) => `${Math.round(percent * 100)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1A2634', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F1F5F9' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table by type */}
          <div
            style={{
              background: 'var(--card)',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Detalle por tipo</h3>
            </div>
            {byType.map((row, i) => (
              <div
                key={row.name}
                style={{
                  padding: '12px 16px',
                  borderBottom: i < byType.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    background: COLORS[i % COLORS.length],
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{row.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                    Promedio: {row.count > 0 ? avgMinutes(row.totalMs / row.count) : '—'} · {row.delays} retrasos
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: COLORS[i % COLORS.length] }}>{row.count}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>lotes</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
