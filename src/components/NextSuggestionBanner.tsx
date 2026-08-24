import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, PlayCircle, CheckCircle2 } from 'lucide-react';
import { TeamMember, TaskRecord } from '../types';
import { getInitials } from '../utils/helpers';

interface NextSuggestionBannerProps {
  members: TeamMember[];
  todayTasks: TaskRecord[];
  activeTabRole: string; // 'all' or specific role
  onAssignTask: (member: TeamMember) => void;
  onOpenDetails?: (member: TeamMember) => void;
}

export const NextSuggestionBanner: React.FC<NextSuggestionBannerProps> = ({
  members,
  todayTasks,
  activeTabRole,
  onAssignTask,
}) => {
  // Filter by tab if selected
  const tabMembers = members.filter((m) =>
    activeTabRole === 'all' ? true : m.role === activeTabRole
  );
  const presentMembers = tabMembers.filter((m) => m.available);

  if (members.length === 0 || tabMembers.length === 0) {
    return null;
  }

  if (presentMembers.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800 text-sm">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <p>
          Todos os colaboradores {activeTabRole !== 'all' ? `da função "${activeTabRole}"` : ''} estão marcados como <strong>ausentes</strong> no momento.
          Ative a disponibilidade para receber sugestões de distribuição.
        </p>
      </div>
    );
  }

  // Calculate task counts and active task status today
  const countMap: Record<string, number> = {};
  const lastTaskTimeMap: Record<string, number> = {};
  const activeTaskMap: Record<string, TaskRecord> = {};

  presentMembers.forEach((m) => {
    countMap[m.id] = 0;
    lastTaskTimeMap[m.id] = 0;
  });

  todayTasks.forEach((t) => {
    if (countMap[t.memberId] !== undefined) {
      countMap[t.memberId] += 1;
      if (t.timestamp > lastTaskTimeMap[t.memberId]) {
        lastTaskTimeMap[t.memberId] = t.timestamp;
      }
    }
    if (t.status === 'in_progress' || (!t.completedAt && t.status !== 'completed')) {
      activeTaskMap[t.memberId] = t;
    }
  });

  // Free/Available candidates (Present AND Not in an active task)
  const freeCandidates = presentMembers.filter((m) => !activeTaskMap[m.id]);
  const busyCount = presentMembers.length - freeCandidates.length;

  if (freeCandidates.length === 0) {
    // All present members are currently in task
    return (
      <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  Equipe em Atividade
                </span>
                <span className="text-xs text-amber-800 font-medium">
                  {busyCount} de {presentMembers.length} em tarefa
                </span>
              </div>
              <p className="text-xs text-amber-900 font-medium mt-1">
                Todos os colaboradores presentes {activeTabRole !== 'all' ? `de "${activeTabRole}"` : ''} estão executando tarefas agora.
                Para liberar alguém para a próxima demanda, clique em <strong>&quot;Encerrar Tarefa&quot;</strong> no card do colaborador.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Find free member with lowest count
  let minCount = Infinity;
  freeCandidates.forEach((m) => {
    const count = countMap[m.id];
    if (count < minCount) {
      minCount = count;
    }
  });

  const candidatesWithMin = freeCandidates.filter(
    (m) => countMap[m.id] === minCount
  );

  // If tie, pick the one who got a task longest ago (oldest lastTaskTime)
  const suggestedMember = candidatesWithMin.sort((a, b) => {
    return (lastTaskTimeMap[a.id] || 0) - (lastTaskTimeMap[b.id] || 0);
  })[0];

  const candidateCount = candidatesWithMin.length;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xs shrink-0"
            style={{ backgroundColor: suggestedMember.avatarColor }}
          >
            {getInitials(suggestedMember.name)}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3" />
                Próxima Recomendação {activeTabRole !== 'all' ? `• ${activeTabRole}` : ''}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Disponível Agora
              </span>
              <span className="text-[11px] text-zinc-500 font-medium">
                ({suggestedMember.role})
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-zinc-900 mt-1">
              Peça para:{' '}
              <span className="text-blue-900 underline decoration-blue-300 underline-offset-3">
                {suggestedMember.name}
              </span>
            </h2>

            <p className="text-xs text-zinc-600 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
              <span>
                {minCount === 0
                  ? 'Livre e ainda não recebeu nenhuma tarefa hoje.'
                  : `Livre no momento, com ${minCount} ${minCount === 1 ? 'tarefa realizada' : 'tarefas realizadas'} hoje.`}
                {candidateCount > 1 ? ` (${candidateCount} colaboradores livres com ${minCount})` : ''}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            id={`btn-suggested-assign-${suggestedMember.id}`}
            type="button"
            onClick={() => onAssignTask(suggestedMember)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>+1 Pedir Tarefa para {suggestedMember.name.split(' ')[0]}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
