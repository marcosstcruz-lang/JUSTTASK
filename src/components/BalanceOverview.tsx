import React from 'react';
import { Scale, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { TeamMember, TaskRecord } from '../types';

interface BalanceOverviewProps {
  members: TeamMember[];
  todayTasks: TaskRecord[];
}

export const BalanceOverview: React.FC<BalanceOverviewProps> = ({
  members,
  todayTasks,
}) => {
  const activeMembers = members.filter((m) => m.available);
  const totalTasks = todayTasks.length;

  if (activeMembers.length === 0 || totalTasks === 0) {
    return null;
  }

  // Calculate stats
  const countMap: Record<string, number> = {};
  activeMembers.forEach((m) => {
    countMap[m.id] = 0;
  });

  todayTasks.forEach((t) => {
    if (countMap[t.memberId] !== undefined) {
      countMap[t.memberId] += 1;
    }
  });

  const counts = Object.values(countMap);
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);
  const diff = maxCount - minCount;
  const average = (totalTasks / activeMembers.length).toFixed(1);

  let statusText = 'Excelente Equilíbrio';
  let statusDesc = 'Todas as pessoas ativas receberam praticamente a mesma quantidade de tarefas.';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let StatusIcon = CheckCircle;

  if (diff >= 3) {
    statusText = 'Atenção ao Desbalanceamento';
    statusDesc = `Há uma diferença de ${diff} tarefas entre quem mais recebeu (${maxCount}) e quem menos recebeu (${minCount}). Priorize quem está com menos.`;
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    StatusIcon = AlertTriangle;
  } else if (diff === 2) {
    statusText = 'Distribuição Adequada';
    statusDesc = 'Diferença leve de apenas 2 tarefas. Continue priorizando os membros com menor contagem.';
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    StatusIcon = TrendingUp;
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-zinc-900">Diagnóstico de Distribuição</h3>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {statusText}
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3">
          <p className="text-[11px] font-medium text-zinc-500">Média por Pessoa</p>
          <p className="text-xl font-bold text-zinc-900 mt-0.5">{average}</p>
          <p className="text-[10px] text-zinc-400">tarefas/membro</p>
        </div>

        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3">
          <p className="text-[11px] font-medium text-zinc-500">Menor Carga</p>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">{minCount}</p>
          <p className="text-[10px] text-zinc-400">tarefas</p>
        </div>

        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3">
          <p className="text-[11px] font-medium text-zinc-500">Maior Carga</p>
          <p className="text-xl font-bold text-blue-600 mt-0.5">{maxCount}</p>
          <p className="text-[10px] text-zinc-400">tarefas</p>
        </div>
      </div>

      <p className="text-xs text-zinc-500 mt-3 bg-zinc-50/70 p-2.5 rounded-lg border border-zinc-100 leading-relaxed">
        {statusDesc}
      </p>
    </div>
  );
};
