import { useState } from 'react';
import { Clock, Calendar, Droplets, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../context';
import { Batch } from '../types';

function durationLabel(start: string, end?: string): string {
  if (!end) return '—';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hrs > 0) return `${hrs}h ${rem}m`;
  return `${mins}m`;
}

function delayCount(batch: Batch): number {
  return batch.steps.filter(s => {
    if (!s.completed || !s.completedAt) return false;
    return new Date(s.completedAt).getTime() > new Date(s.scheduledTime).getTime() + 60000;
  }).length;
}

function statusBadge(batch: Batch) {
  if (batch.status === 'completed') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22C55E', fontSize: '12px', fontWeight: 700 }}>
        <CheckCircle2 size={14} /> Completado
      </span>
    );
  }
  if (batch.status === 'cancelled') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#EF4444', fontSize: '12px', fontWeight: 700 }}>
        <XCircle size={14} /> Cancelado
      </span>
    );
  }
  return (
    <span style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 700 }}>Activo</span>
  );
}

export function History() {
  const { batches, cheeseTypes } = useApp();
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const finished = batches
    .filter(b => b.status !== 'active')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered = finished.filter(b => {
    if (filterType && b.cheeseTypeId !== filterType) return false;
    if (filterDate) {
      const bDate = new Date(b.startTime).toISOString().slice(0, 10);
      if (bDate !== filterDate) return false;
    }
    return true;
  });

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-background)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: 'var(--foreground)',
    fontSize: '14px',
    outline: 'none',
    flex: 1,
  };

  return (
    <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Historial</h1>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '18px' }}>
        {finished.length} lote{finished.length !== 1 ? 's' : ''} registrado{finished.length !== 1 ? 's' : ''}
      </p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        >
          <option value="">Todos los tipos</option>
          {cheeseTypes.map(ct => (
            <option key={ct.id} value={ct.id}>{ct.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          style={{ ...inputStyle, colorScheme: 'dark' }}
        />
        {(filterType || filterDate) && (
          <button
            onClick={() => { setFilterType(''); setFilterDate(''); }}
            style={{
              background: 'var(--muted)',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 14px',
              cursor: 'pointer',
              color: 'var(--muted-foreground)',
              fontSize: '13px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            background: 'var(--card)',
            borderRadius: '14px',
            border: '1px solid var(--border)',
            color: 'var(--muted-foreground)',
          }}
        >
          <Clock size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p>Sin registros {filterType || filterDate ? 'para el filtro seleccionado' : 'aún'}.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(batch => {
            const delays = delayCount(batch);
            const dur = durationLabel(batch.startTime, batch.endTime);
            const date = new Date(batch.startTime);
            return (
              <div
                key={batch.id}
                style={{
                  background: 'var(--card)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 800 }}>{batch.batchName}</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{batch.cheeseTypeName}</div>
                  </div>
                  {statusBadge(batch)}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px',
                    fontSize: '13px',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={13} />
                    {date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={13} />
                    {date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    {batch.endTime ? ` → ${new Date(batch.endTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}` : ''}
                  </span>
                  {batch.milkLiters && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Droplets size={13} />
                      {batch.milkLiters}L
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={13} />
                    Duración: <strong style={{ color: 'var(--foreground)', marginLeft: '3px' }}>{dur}</strong>
                  </span>
                  {delays > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#F59E0B' }}>
                      <AlertTriangle size={13} />
                      {delays} retraso{delays !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {batch.notes && (
                  <div
                    style={{
                      marginTop: '10px',
                      fontSize: '13px',
                      color: 'var(--muted-foreground)',
                      background: 'var(--muted)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                    }}
                  >
                    📝 {batch.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
