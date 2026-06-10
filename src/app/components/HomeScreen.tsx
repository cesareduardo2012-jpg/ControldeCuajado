import { useNavigate } from 'react-router';
import { Plus, FlaskConical, Settings, Clock, BarChart3 } from 'lucide-react';
import { useApp } from '../context';

export function HomeScreen() {
  const navigate = useNavigate();
  const { batches } = useApp();
  const activeBatchCount = batches.filter(b => b.status === 'active').length;
  const completedToday = batches.filter(b => {
    const today = new Date().toDateString();
    return b.status === 'completed' && new Date(b.endTime ?? b.createdAt).toDateString() === today;
  }).length;

  const mainButtons = [
    {
      label: 'Cuajar nuevo tambo',
      icon: Plus,
      path: '/nuevo-tambo',
      primary: true,
      description: 'Iniciar proceso de cuajado',
    },
    {
      label: 'Tambos en proceso',
      icon: FlaskConical,
      path: '/tambos-activos',
      primary: false,
      badge: activeBatchCount > 0 ? activeBatchCount : undefined,
      description: activeBatchCount > 0 ? `${activeBatchCount} tambo${activeBatchCount !== 1 ? 's' : ''} activo${activeBatchCount !== 1 ? 's' : ''}` : 'Sin tambos activos',
    },
    {
      label: 'Configuración de quesos',
      icon: Settings,
      path: '/configuracion',
      primary: false,
      description: 'Tipos de queso y procesos',
    },
    {
      label: 'Historial',
      icon: Clock,
      path: '/historial',
      primary: false,
      description: 'Registros de producción',
    },
    {
      label: 'Estadísticas',
      icon: BarChart3,
      path: '/estadisticas',
      primary: false,
      description: 'Análisis y gráficas',
    },
  ];

  return (
    <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>
      {/* Status bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            background: 'var(--card)',
            borderRadius: '12px',
            padding: '16px',
            border: activeBatchCount > 0 ? '1px solid var(--primary)' : '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '36px', fontWeight: 800, color: activeBatchCount > 0 ? 'var(--primary)' : 'var(--muted-foreground)' }}>
            {activeBatchCount}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
            En proceso
          </div>
        </div>
        <div
          style={{
            background: 'var(--card)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--foreground)' }}>
            {completedToday}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
            Hoy completados
          </div>
        </div>
      </div>

      {/* Nav buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {mainButtons.map(btn => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.path}
              onClick={() => navigate(btn.path)}
              style={{
                background: btn.primary ? 'var(--primary)' : 'var(--card)',
                color: btn.primary ? 'var(--primary-foreground)' : 'var(--foreground)',
                border: btn.primary ? 'none' : '1px solid var(--border)',
                borderRadius: '14px',
                padding: '20px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                textAlign: 'left',
                width: '100%',
                transition: 'transform 0.1s, box-shadow 0.1s',
                position: 'relative',
                boxShadow: btn.primary ? '0 4px 20px rgba(245,158,11,0.25)' : 'none',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div
                style={{
                  background: btn.primary ? 'rgba(0,0,0,0.15)' : 'var(--muted)',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.2 }}>{btn.label}</div>
                <div
                  style={{
                    fontSize: '13px',
                    marginTop: '3px',
                    color: btn.primary ? 'rgba(0,0,0,0.6)' : 'var(--muted-foreground)',
                  }}
                >
                  {btn.description}
                </div>
              </div>
              {btn.badge !== undefined && (
                <span
                  style={{
                    background: '#EF4444',
                    color: '#fff',
                    borderRadius: '14px',
                    fontSize: '16px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    minWidth: '32px',
                    textAlign: 'center',
                  }}
                >
                  {btn.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <p
        style={{
          textAlign: 'center',
          color: 'var(--muted-foreground)',
          fontSize: '12px',
          marginTop: '24px',
        }}
      >
        Quesería Control · Hecha por: Cesar Eduardo Amezcua Ceja
      </p>
    </div>
  );
}
