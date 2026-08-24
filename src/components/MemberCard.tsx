import React from 'react';
import {
  Plus,
  Minus,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  FileText,
  CheckCircle2,
  Briefcase,
  PlayCircle,
  Timer
} from 'lucide-react';
import { TeamMember, TaskRecord } from '../types';
import { getInitials, formatTimePtBR, formatTimeElapsedPtBR } from '../utils/helpers';

interface MemberCardProps {
  member: TeamMember;
  taskCount: number;
  activeTask?: TaskRecord;
  lastTaskTimestamp?: number;
  maxTasksInTeam: number;
  isSuggested: boolean;
  onRequestTask: (member: TeamMember) => void;
  onCompleteTask: (taskId: string) => void;
  onDecrement: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  onOpenDetails: (member: TeamMember) => void;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  taskCount,
  activeTask,
  lastTaskTimestamp,
  maxTasksInTeam,
  isSuggested,
  onRequestTask,
  onCompleteTask,
  onDecrement,
  onToggleAvailability,
  onOpenDetails,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Status computation
  const isAbsent = !member.available;
  const isInTask = member.available && Boolean(activeTask);
  const isAvailable = member.available && !activeTask;

  // Percentage for workload meter
  const loadPercentage = maxTasksInTeam > 0 ? Math.min(100, Math.round((taskCount / maxTasksInTeam) * 100)) : 0;

  return (
    <div
      id={`member-card-${member.id}`}
      className={`relative rounded-2xl border transition-all duration-200 bg-white flex flex-col justify-between ${
        isAbsent
          ? 'border-zinc-200 bg-zinc-50/70 opacity-75'
          : isInTask
          ? 'border-amber-300 ring-2 ring-amber-100/80 shadow-xs'
          : isSuggested
          ? 'border-blue-400 ring-2 ring-blue-100 shadow-sm'
          : 'border-zinc-200 hover:border-zinc-300 shadow-xs'
      }`}
    >
      {/* Top Highlight Ribbons */}
      {isSuggested && isAvailable && (
        <div className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs z-10">
          Mais Livre
        </div>
      )}

      {isInTask && (
        <div className="absolute -top-2.5 right-4 bg-amber-500 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs z-10 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>Em Tarefa</span>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Top row: Avatar + Name (Clickable) + Menu */}
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onOpenDetails(member)}
            className="flex items-center gap-3 min-w-0 text-left cursor-pointer group flex-1"
            title="Clique para ver o histórico de tarefas deste colaborador"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs group-hover:scale-105 transition-transform relative"
              style={{ backgroundColor: member.avatarColor }}
            >
              {getInitials(member.name)}
              {/* Online/Busy Status Dot on Avatar */}
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  isAbsent
                    ? 'bg-zinc-400'
                    : isInTask
                    ? 'bg-amber-500 ring-1 ring-amber-300'
                    : 'bg-emerald-500 ring-1 ring-emerald-300'
                }`}
                title={isAbsent ? 'Ausente' : isInTask ? 'Em Tarefa' : 'Disponível'}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-zinc-900 truncate leading-snug group-hover:text-blue-600 transition-colors flex items-center gap-1">
                <span className="truncate">{member.name}</span>
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {member.role || 'Operacional'}
                </span>
                <span className="text-[10px] text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                  Ver histórico →
                </span>
              </div>
            </div>
          </button>

          {/* Card menu dropdown */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
              title="Mais opções"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-zinc-100 py-1.5 z-20 text-xs font-medium text-zinc-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenDetails(member);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ver Histórico e Tarefas</span>
                </button>

                {activeTask && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onCompleteTask(activeTask.id);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Encerrar Tarefa Atual</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onToggleAvailability(member.id);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                >
                  {member.available ? (
                    <>
                      <UserX className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Marcar como Ausente</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Marcar como Disponível</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(member);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Editar Nome / Função</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(member.id);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Excluir Membro</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Status Badge Row */}
        <div className="mt-3.5 flex items-center justify-between gap-2">
          {/* Status Label */}
          {isAbsent ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
              <span>Ausente hoje</span>
            </span>
          ) : isInTask ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Em Tarefa</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Disponível (Livre)</span>
            </span>
          )}

          {/* Quick toggle availability button */}
          <button
            type="button"
            onClick={() => onToggleAvailability(member.id)}
            className="text-[11px] text-zinc-400 hover:text-zinc-700 underline underline-offset-2 transition-colors cursor-pointer"
          >
            {member.available ? 'Pausar/Ausente' : 'Ativar'}
          </button>
        </div>

        {/* Active Task Banner if currently in task */}
        {isInTask && activeTask && (
          <div className="mt-3 bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 text-left">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                  <PlayCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Tarefa em andamento:</span>
                </div>
                <p className="text-xs font-bold text-zinc-900 mt-1 truncate" title={activeTask.taskTitle}>
                  {activeTask.taskTitle || 'Demanda solicitada'}
                </p>
                <p className="text-[11px] text-amber-800/80 mt-0.5 flex items-center gap-1">
                  <Timer className="w-3 h-3 text-amber-600" />
                  <span>Iniciada às {formatTimePtBR(activeTask.timestamp)} ({formatTimeElapsedPtBR(activeTask.timestamp)})</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Counter and Visual Meter */}
        <div className="mt-3 pt-3 border-t border-zinc-100">
          <div className="flex items-baseline justify-between">
            <button
              type="button"
              onClick={() => onOpenDetails(member)}
              className="flex items-baseline gap-1.5 text-left group cursor-pointer"
              title="Clique para ver o detalhe das tarefas"
            >
              <span className="text-2xl font-extrabold text-zinc-900 group-hover:text-blue-600 transition-colors">
                {taskCount}
              </span>
              <span className="text-xs font-medium text-zinc-500">
                {taskCount === 1 ? 'tarefa hoje' : 'tarefas hoje'}
              </span>
            </button>

            <span className="text-[11px] text-zinc-400">
              {lastTaskTimestamp ? `Última: ${formatTimePtBR(lastTaskTimestamp)}` : 'Nenhuma hoje'}
            </span>
          </div>

          {/* Workload relative progress bar */}
          <div className="mt-2">
            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  taskCount === 0
                    ? 'bg-transparent'
                    : taskCount === maxTasksInTeam && maxTasksInTeam > 2
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${Math.max(5, loadPercentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="p-4 sm:p-5 pt-0 mt-auto">
        {isInTask && activeTask ? (
          /* When in task: Primary button is ENCERRAR TAREFA */
          <div className="flex items-center gap-2">
            <button
              id={`btn-complete-task-${member.id}`}
              type="button"
              onClick={() => onCompleteTask(activeTask.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-xs transition-all cursor-pointer"
              title="Finalizar esta tarefa e liberar o colaborador como Disponível"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Encerrar Tarefa</span>
            </button>

            <button
              id={`btn-new-task-extra-${member.id}`}
              type="button"
              onClick={() => onRequestTask(member)}
              title="Atribuir outra tarefa em paralelo"
              className="p-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* When available: Primary button is +1 PEDIR TAREFA */
          <div className="flex items-center gap-2">
            <button
              id={`btn-increment-${member.id}`}
              type="button"
              disabled={!member.available}
              onClick={() => onRequestTask(member)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-2xs ${
                !member.available
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white cursor-pointer'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+1 Pedir Tarefa</span>
            </button>

            {taskCount > 0 && (
              <button
                id={`btn-decrement-${member.id}`}
                type="button"
                onClick={() => onDecrement(member.id)}
                title="Reduzir 1 tarefa (corrigir engano)"
                className="p-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800 transition-colors cursor-pointer shrink-0"
              >
                <Minus className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
