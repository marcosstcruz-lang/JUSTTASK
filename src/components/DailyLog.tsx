import React from 'react';
import { History, Trash2, Clock, CheckCheck, CheckCircle2, PlayCircle, Timer } from 'lucide-react';
import { TaskRecord, TeamMember } from '../types';
import { formatTimePtBR, formatDurationPtBR, getInitials } from '../utils/helpers';

interface DailyLogProps {
  records: TaskRecord[];
  members: TeamMember[];
  onRemoveRecord: (recordId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onOpenMemberDetails?: (member: TeamMember) => void;
}

export const DailyLog: React.FC<DailyLogProps> = ({
  records,
  members,
  onRemoveRecord,
  onCompleteTask,
  onOpenMemberDetails,
}) => {
  // Map member data
  const memberMap = React.useMemo(() => {
    const map: Record<string, TeamMember> = {};
    members.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [members]);

  const sortedRecords = React.useMemo(() => {
    return [...records].sort((a, b) => b.timestamp - a.timestamp);
  }, [records]);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-bold text-zinc-900">Histórico de Hoje</h3>
          <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-medium">
            {records.length} {records.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
      </div>

      {sortedRecords.length === 0 ? (
        <div className="py-8 text-center my-auto">
          <div className="w-10 h-10 rounded-full bg-zinc-50 text-zinc-400 flex items-center justify-center mx-auto mb-2">
            <CheckCheck className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-zinc-600">Nenhuma solicitação ainda hoje</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ao clicar em &quot;+1 Pedir Tarefa&quot;, os registros aparecerão aqui em ordem cronológica.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 mt-2 max-h-96 overflow-y-auto pr-1">
          {sortedRecords.map((record) => {
            const member = memberMap[record.memberId];
            const avatarColor = member?.avatarColor || '#4f46e5';
            const isInProgress = record.status === 'in_progress' || (!record.completedAt && record.status !== 'completed');

            return (
              <div
                key={record.id}
                className={`py-3 flex items-center justify-between gap-3 group px-2 rounded-xl transition-colors ${
                  isInProgress ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-zinc-50/80'
                }`}
              >
                <div
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  onClick={() => member && onOpenMemberDetails && onOpenMemberDetails(member)}
                  title="Clique para ver todo o histórico deste colaborador"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs relative"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {getInitials(record.memberName)}
                    {isInProgress && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-zinc-900 truncate hover:text-blue-600 transition-colors">
                        {record.memberName}
                      </p>
                      {(member?.role || record.memberRole) && (
                        <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded font-medium truncate">
                          {member?.role || record.memberRole}
                        </span>
                      )}

                      {/* Status tag */}
                      {isInProgress ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                          <PlayCircle className="w-2.5 h-2.5" />
                          Em Andamento
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Concluída ({formatDurationPtBR(record.timestamp, record.completedAt)})
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-600 truncate flex items-center gap-1.5 mt-0.5">
                      <span className="text-zinc-900 font-semibold truncate">
                        {record.taskTitle || 'Demanda solicitada'}
                      </span>
                      <span className="text-zinc-300">•</span>
                      <span className="text-zinc-400 shrink-0">
                        Início às {formatTimePtBR(record.timestamp)}
                        {record.completedAt ? ` • Fim às ${formatTimePtBR(record.completedAt)}` : ''}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Encerrar Tarefa direct button if in progress */}
                  {isInProgress && onCompleteTask && (
                    <button
                      type="button"
                      onClick={() => onCompleteTask(record.id)}
                      title="Encerrar esta tarefa agora"
                      className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Encerrar</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onRemoveRecord(record.id)}
                    title="Excluir este registro"
                    className="opacity-40 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
