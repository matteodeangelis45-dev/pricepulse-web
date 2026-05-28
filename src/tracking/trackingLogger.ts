import type { TrackingWorkflowStage } from './trackingModels';

export interface TrackingLogEntry {
  stage: TrackingWorkflowStage;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
  created_at: string;
}

export function createTrackingLogger() {
  const entries: TrackingLogEntry[] = [];

  function push(level: TrackingLogEntry['level'], stage: TrackingWorkflowStage, message: string, context?: Record<string, unknown>) {
    entries.push({ level, stage, message, context, created_at: new Date().toISOString() });
  }

  return {
    info: (stage: TrackingWorkflowStage, message: string, context?: Record<string, unknown>) => push('info', stage, message, context),
    warn: (stage: TrackingWorkflowStage, message: string, context?: Record<string, unknown>) => push('warn', stage, message, context),
    error: (stage: TrackingWorkflowStage, message: string, context?: Record<string, unknown>) => push('error', stage, message, context),
    entries: () => entries,
  };
}
