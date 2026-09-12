import React from 'react';
import {
  Globe,
  ShieldCheck,
  HardDriveDownload,
  Send,
  Cpu,
  Radio,
  AlertCircle,
  Activity,
  Layers
} from 'lucide-react';
import { PipelineLayer } from '../types';

interface PipelineVisualizerProps {
  selectedLayer: PipelineLayer;
  onSelectLayer: (layer: PipelineLayer) => void;
  errorCode?: string;
}

interface StepInfo {
  layer: PipelineLayer;
  shortLabel: string;
  stepRange: string;
  boundaryName: string;
  icon: React.ElementType;
}

const PIPELINE_STEPS: StepInfo[] = [
  {
    layer: 'Layer 1: DNS / Client Network / IdP SSO',
    shortLabel: 'DNS / Network / SSO',
    stepRange: 'Client & Identity',
    boundaryName: 'Edge Domain',
    icon: Globe,
  },
  {
    layer: 'Layer 2: API Gateway / Authentication Edge',
    shortLabel: 'API Gateway / Auth',
    stepRange: 'Ingress & Auth Edge',
    boundaryName: 'Ingress Proxy',
    icon: ShieldCheck,
  },
  {
    layer: 'Layer 3: Storage Ingestion Service (DB write, asset retrieval)',
    shortLabel: 'Storage & DB Ingestion',
    stepRange: 'Steps 2–3: Persistence',
    boundaryName: 'Blob & DB Core',
    icon: HardDriveDownload,
  },
  {
    layer: 'Layer 4: Worker Queues / Async Processing Containers',
    shortLabel: 'Worker Queues',
    stepRange: 'Async Packaging',
    boundaryName: 'Compute Pods',
    icon: Cpu,
  },
  {
    layer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)',
    shortLabel: 'Downstream Partner API',
    stepRange: 'Steps 4–6: Partner API',
    boundaryName: 'Egress Handshake',
    icon: Send,
  },
  {
    layer: 'Layer 6: Webhook / Callback Notification',
    shortLabel: 'Webhook Dispatcher',
    stepRange: 'Callback Notification',
    boundaryName: 'Notification ACK',
    icon: Radio,
  },
];

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  selectedLayer,
  onSelectLayer,
  errorCode,
}) => {
  const selectedStepIdx = PIPELINE_STEPS.findIndex((s) => s.layer === selectedLayer);

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur-sm transition-all duration-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Architecture Isolation
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Stage {selectedStepIdx !== -1 ? selectedStepIdx + 1 : 1} of 6 Targeted
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight mt-0.5">
              Pipeline Demarcation & Multi-Tier Service Topology
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Isolate failure boundaries across internal microservices, ingress gateways, and external partner endpoints.
            </p>
          </div>
        </div>

        {errorCode && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/25 shadow-sm self-start sm:self-center">
            <AlertCircle className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>Failing Status: <strong className="text-rose-200">{errorCode}</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {PIPELINE_STEPS.map((step, idx) => {
          const isSelected = selectedLayer === step.layer;
          const Icon = step.icon;

          return (
            <button
              id={`pipeline-step-${idx}`}
              key={step.layer}
              type="button"
              onClick={() => onSelectLayer(step.layer)}
              className={`group relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer transform hover:scale-[1.02] ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40 text-slate-100'
                  : 'bg-slate-900/70 hover:bg-slate-900/90 border-slate-800/80 hover:border-blue-500/40 text-slate-300 hover:text-slate-100'
              }`}
            >
              {/* Top row: Icon and Stage Number */}
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 shadow-sm'
                      : 'bg-slate-800/90 text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  0{idx + 1}
                </span>
              </div>

              {/* Step Labels */}
              <div className="font-semibold text-xs leading-tight mb-1 line-clamp-1 group-hover:text-white transition-colors">
                {step.shortLabel}
              </div>
              <div className="text-[10px] text-slate-400 line-clamp-1">
                {step.stepRange}
              </div>
              <div className="text-[9px] font-mono uppercase text-slate-500 group-hover:text-slate-400 mt-1">
                {step.boundaryName}
              </div>

              {/* Selected Pulse Indicator Badge */}
              {isSelected ? (
                <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 items-center justify-center text-[8px] font-bold text-slate-950">
                    ✓
                  </span>
                </div>
              ) : (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] text-blue-400 font-mono">Select →</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
