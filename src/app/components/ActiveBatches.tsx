import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, CheckCircle2, Clock, AlertTriangle, X, SkipForward } from 'lucide-react';
import { useApp } from '../context';
import { Batch, ProcessStep } from '../types';
import { formatDuration, getStepStatus } from '../store';

function StepRow({
  step,
  batchId,
  isNext,
}: {
  step: ProcessStep;
  batchId: string;
  isNext: boolean;
}) {
  const { completeStep, postponeStep } = useApp();
  const status = getStepStatus(step.scheduledTime, step.completed);
  const timeLeft = new Date(step.scheduledTime).getTime() - Date.now();

  const statusColor =
    step.completed ? '#22C55E' :
    status === 'overdue' ? '#EF4444' :
    status === 'soon' ? '#F59E0B' :
    'var(--muted-foreground)';

  const iconMap = {
    cross: '✂️',
    break: '⚡',
    extract: '🧺',
  };

  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: '10px',
        background: isNext && !step.completed ? 'rgba(245,158,11,0.08)' : 'transparent',
        border: isNext && !step.completed ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
        marginBottom: '6px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px', flexShrink: 0 }}>{iconMap[step.type]}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: step.completed ? 'var(--muted-foreground)' : 'var(--foreground)',
              textDecoration: step.completed ? 'line-through' : 'none',
            }}
          >
            {step.title}
          </div>
          <div style={{ fontSize: '12px', color: statusColor, marginTop: '2px' }}>
            {step.completed
              ? `Completado ${step.completedAt ? new Date(step.completedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}`
              : status === 'overdue'
              ? `Retrasado ${formatDuration(Math.abs(timeLeft))}`
              : `${new Date(step.scheduledTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} · ${timeLeft > 0 ? 'en ' + formatDuration(timeLeft) : 'ya'}`}
          </div>
        </div>
        {!step.completed && (
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={() => postponeStep(batchId, step.id, 5)}
              title="Posponer 5 min"
              style={{
                background: 'var(--muted)',
                border: 'none',
                borderRadius: '7px',
                padding: '6px 8px',
                cursor: 'pointer',
                color: 'var(--muted-foreground)',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              +5m
            </button>
            <button
              onClick={() => postponeStep(batchId, step.id, 10)}
              title="Posponer 10 min"
              style={{
                background: 'var(--muted)',
                border: 'none',
                borderRadius: '7px',
                padding: '6px 8px',
                cursor: 'pointer',
                color: 'var(--muted-foreground)',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              +10m
            </button>
            <button
              onClick={() => completeStep(batchId, step.id)}
              title="Completado"
              style={{
                background: 'var(--primary)',
                border: 'none',
                borderRadius: '7px',
                padding: '6px 10px',
                cursor: 'pointer',
                color: 'var(--primary-foreground)',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckCircle2 size={14} />
              Listo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BatchCard({ batch }: { batch: Batch }) {
  const { completeBatch, cancelBatch } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const pendingSteps = batch.steps.filter(s => !s.completed);
  const nextStep = pendingSteps[0];
  const completedCount = batch.steps.filter(s => s.completed).length;
  const progress = batch.steps.length > 0 ? (completedCount / batch.steps.length) * 100 : 0;

  const overallStatus = !nextStep
    ? 'done'
    : getStepStatus(nextStep.scheduledTime, nextStep.completed) === 'overdue'
    ? 'overdue'
    : getStepStatus(nextStep.scheduledTime, nextStep.completed) === 'soon'
    ? 'soon'
    : 'on-track';

  const statusColors = {
    done: '#22C55E',
    overdue: '#EF4444',
    soon: '#F59E0B',
    'on-track': '#3B82F6',
  };

  const statusLabels = {
    done: 'Completado',
    overdue: 'Retrasado',
    soon: 'Próximo paso',
    'on-track': 'En tiempo',
  };

  const timeLeft = nextStep ? new Date(nextStep.scheduledTime).getTime() - Date.now() : 0;
  const startedAt = new Date(batch.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        background: 'var(--card)',
        borderRadius: '14px',
        border: `1px solid ${overallStatus === 'overdue' ? '#EF4444' : overallStatus === 'soon' ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`,
        marginBottom: '14px',
        overflow: 'hidden',
      }}
    >
      {/* Card header */}
      <div
        style={{ padding: '16px', cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '18px', fontWeight: 800 }}>
                {batch.batchName}
              </span>
              <span
                style={{
                  background: statusColors[overallStatus] + '22',
                  color: statusColors[overallStatus],
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  border: `1px solid ${statusColors[overallStatus]}44`,
                }}
              >
                {statusLabels[overallStatus]}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '3px' }}>
              {batch.cheeseTypeName} · Inicio: {startedAt}
              {batch.milkLiters ? ` · ${batch.milkLiters}L` : ''}
            </div>
          </div>
          <span style={{ fontSize: '18px', color: 'var(--muted-foreground)' }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            background: 'var(--muted)',
            borderRadius: '4px',
            height: '6px',
            marginTop: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: overallStatus === 'done' ? '#22C55E' : 'var(--primary)',
              borderRadius: '4px',
              height: '100%',
              width: `${progress}%`,
              transition: 'width 0.5s',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
          <span>{completedCount}/{batch.steps.length} pasos</span>
          {nextStep && (
            <span style={{ color: statusColors[overallStatus], fontWeight: 700 }}>
              {overallStatus === 'overdue' ? '⚠ ' : ''}{nextStep.title} {timeLeft > 0 ? `· ${formatDuration(timeLeft)}` : '¡Ahora!'}
            </span>
          )}
        </div>
      </div>

      {/* Expanded steps */}
      {expanded && (
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '8px' }}>
            {batch.steps.map((step, idx) => {
              const isNext = !step.completed && idx === completedCount;
              return <StepRow key={step.id} step={step} batchId={batch.id} isNext={isNext} />;
            })}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            {overallStatus === 'done' && (
              <button
                onClick={() => completeBatch(batch.id)}
                style={{
                  flex: 1,
                  background: '#22C55E',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <SkipForward size={18} />
                Finalizar tambo
              </button>
            )}
            {showConfirmCancel ? (
              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowConfirmCancel(false)}
                  style={{
                    flex: 1,
                    background: 'var(--muted)',
                    color: 'var(--foreground)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Volver
                </button>
                <button
                  onClick={() => cancelBatch(batch.id)}
                  style={{
                    flex: 1,
                    background: '#EF4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Sí, cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmCancel(true)}
                style={{
                  background: 'var(--muted)',
                  color: '#EF4444',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <X size={16} />
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ActiveBatches() {
  const { batches, tick } = useApp();
  const navigate = useNavigate();
  // tick drives 1-second re-renders for countdown timers
  void tick;

  const activeBatches = batches.filter(b => b.status === 'active');
  const overdueCount = activeBatches.filter(b => {
    const nextPending = b.steps.find(s => !s.completed);
    return nextPending && getStepStatus(nextPending.scheduledTime, false) === 'overdue';
  }).length;

  return (
    <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Tambos en proceso</h1>
        <button
          onClick={() => navigate('/nuevo-tambo')}
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
          Nuevo
        </button>
      </div>

      {overdueCount > 0 && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid #EF4444',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertTriangle size={20} color="#EF4444" />
          <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '15px' }}>
            {overdueCount} tambo{overdueCount !== 1 ? 's' : ''} con pasos retrasados
          </span>
        </div>
      )}

      {activeBatches.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--card)',
            borderRadius: '14px',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧀</div>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Sin tambos activos</div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '20px' }}>
            Inicia un proceso de cuajado para comenzar el seguimiento.
          </p>
          <button
            onClick={() => navigate('/nuevo-tambo')}
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Plus size={20} />
            Cuajar nuevo tambo
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Clock size={16} color="var(--muted-foreground)" />
            <span style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
              {activeBatches.length} tambo{activeBatches.length !== 1 ? 's' : ''} activo{activeBatches.length !== 1 ? 's' : ''}
            </span>
          </div>
          {activeBatches.map(batch => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </>
      )}
    </div>
  );
}
