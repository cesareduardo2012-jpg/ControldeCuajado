import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Play, Clock, Droplets, FileText, ChevronDown } from 'lucide-react';
import { useApp } from '../context';

function toLocalDatetimeValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function NewBatchForm() {
  const { cheeseTypes, startBatch } = useApp();
  const navigate = useNavigate();

  const [cheeseTypeId, setCheeseTypeId] = useState(cheeseTypes[0]?.id ?? '');
  const [batchName, setBatchName] = useState('');
  const [startTimeStr, setStartTimeStr] = useState(toLocalDatetimeValue(new Date()));
  const [milkLiters, setMilkLiters] = useState('');
  const [notes, setNotes] = useState('');

  const selectedType = cheeseTypes.find(t => t.id === cheeseTypeId);

  function totalMinutes() {
    if (!selectedType) return 0;
    return selectedType.crossTime + selectedType.breakCount * selectedType.breakInterval + selectedType.extractDelay;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cheeseTypeId) return;
    startBatch({
      cheeseTypeId,
      batchName: batchName.trim() || `Tambo ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`,
      startTime: new Date(startTimeStr),
      notes,
      milkLiters: milkLiters ? parseFloat(milkLiters) : undefined,
    });
    navigate('/tambos-activos');
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-background)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '14px 16px',
    color: 'var(--foreground)',
    fontSize: '16px',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--muted-foreground)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: 'var(--foreground)' }}>
        Nuevo Tambo
      </h1>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '24px' }}>
        Configura e inicia el proceso de cuajado
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Tipo de queso */}
          <div>
            <label style={labelStyle}>Tipo de queso *</label>
            <div style={{ position: 'relative' }}>
              <select
                value={cheeseTypeId}
                onChange={e => setCheeseTypeId(e.target.value)}
                required
                style={{ ...inputStyle, appearance: 'none', paddingRight: '40px', cursor: 'pointer' }}
              >
                {cheeseTypes.length === 0 && (
                  <option value="">— Sin tipos configurados —</option>
                )}
                {cheeseTypes.map(ct => (
                  <option key={ct.id} value={ct.id}>{ct.name}</option>
                ))}
              </select>
              <ChevronDown
                size={20}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted-foreground)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Preview pasos */}
          {selectedType && (
            <div
              style={{
                background: 'var(--muted)',
                borderRadius: '10px',
                padding: '14px 16px',
                borderLeft: '3px solid var(--primary)',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
                Proceso generado automáticamente · {totalMinutes()} min total
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(() => {
                  const steps = [];
                  let elapsed = selectedType.crossTime;
                  steps.push({ time: elapsed, label: 'Cruzar la cuajada' });
                  for (let i = 1; i <= selectedType.breakCount; i++) {
                    elapsed += selectedType.breakInterval;
                    const ord = i === 1 ? 'Primera' : i === 2 ? 'Segunda' : i === 3 ? 'Tercera' : `${i}a`;
                    steps.push({ time: elapsed, label: `${ord} quebrada` });
                  }
                  elapsed += selectedType.extractDelay;
                  steps.push({ time: elapsed, label: 'Sacar a bolsas' });
                  return steps.map(s => (
                    <div key={s.time + s.label} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--foreground)' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 700, minWidth: '45px' }}>{s.time} min</span>
                      <span>{s.label}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Identificador */}
          <div>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Identificador del tambo
                <span style={{ color: 'var(--muted-foreground)', fontWeight: 400, textTransform: 'none', fontSize: '12px' }}>(opcional)</span>
              </span>
            </label>
            <input
              type="text"
              placeholder="Ej: Tambo Norte, Tambo 500L..."
              value={batchName}
              onChange={e => setBatchName(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Hora de cuajado */}
          <div>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} />
                Hora de cuajado
              </span>
            </label>
            <input
              type="datetime-local"
              value={startTimeStr}
              onChange={e => setStartTimeStr(e.target.value)}
              required
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </div>

          {/* Litros */}
          <div>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Droplets size={14} />
                Litros de leche
                <span style={{ color: 'var(--muted-foreground)', fontWeight: 400, textTransform: 'none', fontSize: '12px' }}>(opcional)</span>
              </span>
            </label>
            <input
              type="number"
              placeholder="Ej: 500"
              value={milkLiters}
              onChange={e => setMilkLiters(e.target.value)}
              min="1"
              step="any"
              style={inputStyle}
            />
          </div>

          {/* Observaciones */}
          <div>
            <label style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} />
                Observaciones
                <span style={{ color: 'var(--muted-foreground)', fontWeight: 400, textTransform: 'none', fontSize: '12px' }}>(opcional)</span>
              </span>
            </label>
            <textarea
              placeholder="Notas sobre este lote..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!cheeseTypeId}
            style={{
              background: cheeseTypeId ? 'var(--primary)' : 'var(--muted)',
              color: cheeseTypeId ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              border: 'none',
              borderRadius: '14px',
              padding: '18px',
              fontSize: '18px',
              fontWeight: 800,
              cursor: cheeseTypeId ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              boxShadow: cheeseTypeId ? '0 4px 20px rgba(245,158,11,0.3)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <Play size={22} />
            Iniciar proceso
          </button>

          {cheeseTypes.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--destructive)', fontSize: '14px' }}>
              No hay tipos de queso configurados.{' '}
              <span
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => navigate('/configuracion')}
              >
                Agregar ahora
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
