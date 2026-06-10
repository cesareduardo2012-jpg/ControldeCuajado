import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Bell, Volume2, Vibrate, Clock, Moon, Sun, Monitor } from 'lucide-react';
import { useApp } from '../context';
import { CheeseType } from '../types';

type FormState = {
  name: string;
  crossTime: string;
  breakCount: string;
  breakInterval: string;
  extractDelay: string;
};

const emptyForm: FormState = {
  name: '',
  crossTime: '20',
  breakCount: '3',
  breakInterval: '20',
  extractDelay: '20',
};

function CheeseTypeForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: CheeseType;
  onSave: (data: FormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          name: initial.name,
          crossTime: String(initial.crossTime),
          breakCount: String(initial.breakCount),
          breakInterval: String(initial.breakInterval),
          extractDelay: String(initial.extractDelay),
        }
      : emptyForm
  );

  const setField = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  const total =
    (parseInt(form.crossTime) || 0) +
    (parseInt(form.breakCount) || 0) * (parseInt(form.breakInterval) || 0) +
    (parseInt(form.extractDelay) || 0);

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-background)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: 'var(--foreground)',
    fontSize: '16px',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--card)',
        borderRadius: '14px',
        padding: '20px',
        border: '1px solid var(--primary)',
        marginBottom: '16px',
      }}
    >
      <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px', color: 'var(--primary)' }}>
        {initial ? 'Editar tipo de queso' : 'Nuevo tipo de queso'}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
            Nombre *
          </label>
          <input
            type="text"
            placeholder="Ej: Queso Oreado"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
              Tiempo hasta cruzada (min)
            </label>
            <input
              type="number"
              min="1"
              value={form.crossTime}
              onChange={e => setField('crossTime', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
              Número de quebradas
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={form.breakCount}
              onChange={e => setField('breakCount', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
              Intervalo entre quebradas (min)
            </label>
            <input
              type="number"
              min="1"
              value={form.breakInterval}
              onChange={e => setField('breakInterval', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
              Demora final hasta sacar (min)
            </label>
            <input
              type="number"
              min="1"
              value={form.extractDelay}
              onChange={e => setField('extractDelay', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Process preview */}
        {form.name && (
          <div
            style={{
              background: 'var(--muted)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '13px',
              borderLeft: '3px solid var(--primary)',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>
              Proceso total: {total} minutos
            </div>
            <div style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{form.crossTime}m</span> → Cruzar
              {Array.from({ length: parseInt(form.breakCount) || 0 }).map((_, i) => (
                <span key={i}>
                  {' → '}
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    {(parseInt(form.crossTime) || 0) + (i + 1) * (parseInt(form.breakInterval) || 0)}m
                  </span>
                  {' → '}
                  {i === 0 ? 'Primera' : i === 1 ? 'Segunda' : i === 2 ? 'Tercera' : `${i + 1}a`} quebrada
                </span>
              ))}
              {' → '}
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{total}m</span>
              {' → Sacar a bolsas'}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              background: 'var(--muted)',
              color: 'var(--foreground)',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <X size={16} />
            Cancelar
          </button>
          <button
            type="submit"
            style={{
              flex: 2,
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '15px',
            }}
          >
            <Check size={16} />
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
}

export function CheeseTypeConfig() {
  const { cheeseTypes, addCheeseType, updateCheeseType, deleteCheeseType, appSettings, updateAppSettings, updateNotificationSettings } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSave = (data: FormState) => {
    const parsed = {
      name: data.name.trim(),
      crossTime: parseInt(data.crossTime),
      breakCount: parseInt(data.breakCount),
      breakInterval: parseInt(data.breakInterval),
      extractDelay: parseInt(data.extractDelay),
    };
    if (editingId) {
      updateCheeseType(editingId, parsed);
      setEditingId(null);
    } else {
      addCheeseType(parsed);
      setShowForm(false);
    }
  };

  return (
    <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>
      {/* Tipos de Queso Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Tipos de Queso</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); }}
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
          }}
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '20px' }}>
        Configura los procesos de cuajado para cada tipo de queso.
      </p>

      {(showForm && !editingId) && (
        <CheeseTypeForm
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {cheeseTypes.length === 0 && !showForm && (
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
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧀</div>
            <p>No hay tipos de queso configurados.</p>
          </div>
        )}

        {cheeseTypes.map(ct => {
          const total = ct.crossTime + ct.breakCount * ct.breakInterval + ct.extractDelay;
          return (
            <div key={ct.id}>
              {editingId === ct.id ? (
                <CheeseTypeForm
                  initial={ct}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  style={{
                    background: 'var(--card)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{ct.name}</div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '6px',
                          fontSize: '13px',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        <span>✂️ Cruzada: <strong style={{ color: 'var(--foreground)' }}>{ct.crossTime} min</strong></span>
                        <span>⚡ Quebradas: <strong style={{ color: 'var(--foreground)' }}>{ct.breakCount} × {ct.breakInterval}m</strong></span>
                        <span>🧺 Salida: <strong style={{ color: 'var(--foreground)' }}>{ct.extractDelay} min</strong></span>
                        <span>⏱ Total: <strong style={{ color: 'var(--primary)' }}>{total} min</strong></span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={() => { setEditingId(ct.id); setShowForm(false); }}
                        style={{
                          background: 'var(--muted)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px',
                          cursor: 'pointer',
                          color: 'var(--foreground)',
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      {confirmDeleteId === ct.id ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            style={{ background: 'var(--muted)', border: 'none', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', color: 'var(--foreground)', fontSize: '12px', fontWeight: 700 }}
                          >
                            No
                          </button>
                          <button
                            onClick={() => { deleteCheeseType(ct.id); setConfirmDeleteId(null); }}
                            style={{ background: '#EF4444', border: 'none', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', color: '#fff', fontSize: '12px', fontWeight: 700 }}
                          >
                            Sí
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(ct.id)}
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px',
                            cursor: 'pointer',
                            color: '#EF4444',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Aspecto Visual Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sun size={20} /> Apariencia
        </h2>
        <div style={{
          background: 'var(--card)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid var(--border)',
          display: 'flex',
          gap: '10px'
        }}>
          {(['light', 'dark', 'system'] as const).map(theme => (
            <button
              key={theme}
              onClick={() => updateAppSettings({ theme })}
              style={{
                flex: 1,
                background: appSettings.theme === theme ? 'var(--primary)' : 'var(--muted)',
                color: appSettings.theme === theme ? 'var(--primary-foreground)' : 'var(--foreground)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              {theme === 'light' && <Sun size={20} />}
              {theme === 'dark' && <Moon size={20} />}
              {theme === 'system' && <Monitor size={20} />}
              {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Sistema'}
            </button>
          ))}
        </div>
      </div>

      {/* Notificaciones Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={20} /> Notificaciones
        </h2>
        <div style={{
          background: 'var(--card)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Activar/Desactivar */}
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Activar notificaciones</span>
            <input
              type="checkbox"
              checked={appSettings.notifications.enabled}
              onChange={e => {
                updateNotificationSettings({ enabled: e.target.checked });
                if (e.target.checked && 'Notification' in window) {
                  Notification.requestPermission();
                }
              }}
              style={{ width: '18px', height: '18px' }}
            />
          </label>

          {appSettings.notifications.enabled && (
            <>
              {/* Sonido */}
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted-foreground)' }}>
                  <Volume2 size={16} /> Sonido
                </span>
                <input
                  type="checkbox"
                  checked={appSettings.notifications.sound}
                  onChange={e => updateNotificationSettings({ sound: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
              </label>

              {/* Vibración */}
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted-foreground)' }}>
                  <Vibrate size={16} /> Vibración
                </span>
                <input
                  type="checkbox"
                  checked={appSettings.notifications.vibrate}
                  onChange={e => updateNotificationSettings({ vibrate: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
              </label>

              {/* Aviso Previo */}
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted-foreground)' }}>
                  <Clock size={16} /> Aviso previo (minutos)
                </span>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={appSettings.notifications.advanceNotice}
                  onChange={e => updateNotificationSettings({ advanceNotice: parseInt(e.target.value) || 0 })}
                  style={{
                    background: 'var(--input-background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: 'var(--foreground)',
                    width: '60px',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
