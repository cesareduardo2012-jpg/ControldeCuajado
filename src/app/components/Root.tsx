import { Outlet, useNavigate, useLocation } from 'react-router';
import { Home, FlaskConical, Settings, Clock, BarChart3, ChevronLeft } from 'lucide-react';
import { useApp } from '../context';

const navItems = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/tambos-activos', icon: FlaskConical, label: 'Activos' },
  { path: '/historial', icon: Clock, label: 'Historial' },
  { path: '/estadisticas', icon: BarChart3, label: 'Stats' },
  { path: '/configuracion', icon: Settings, label: 'Config' },
];

export function Root() {
  const { batches } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const activeBatchCount = batches.filter(b => b.status === 'active').length;
  const isHome = location.pathname === '/';

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: '100dvh', background: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Header */}
      <header
        style={{
          background: 'var(--card)',
          borderBottom: '2px solid var(--primary)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {!isHome && (
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'var(--muted)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--foreground)',
            }}
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <span style={{ fontSize: '28px' }}>🧀</span>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1 }}>
              Quesería Control
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1 }}>
              Sistema de cuajado
            </div>
          </div>
        </div>
        {activeBatchCount > 0 && (
          <button
            onClick={() => navigate('/tambos-activos')}
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 14px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FlaskConical size={16} />
            {activeBatchCount} en proceso
          </button>
        )}
      </header>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--card)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          zIndex: 50,
        }}
      >
        {navItems.map(item => {
          const active = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          const showBadge = item.path === '/tambos-activos' && activeBatchCount > 0;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                flex: 1,
                padding: '10px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: active ? 'var(--primary)' : 'var(--muted-foreground)',
                borderTop: active ? '2px solid var(--primary)' : '2px solid transparent',
                position: 'relative',
              }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: '10px', fontWeight: active ? 700 : 400 }}>{item.label}</span>
              {showBadge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: 'calc(50% - 18px)',
                    background: '#EF4444',
                    color: '#fff',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    minWidth: '18px',
                    textAlign: 'center',
                  }}
                >
                  {activeBatchCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
