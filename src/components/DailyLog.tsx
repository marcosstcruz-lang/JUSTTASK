import React from 'react';
import { History, Trash2, Clock, CheckCheck, Briefcase } from 'lucide-react';
import { TaskRecord, TeamMember } from '../types';
import { formatTimePtBR, getInitials } from '../utils/helpers';

interface DailyLogProps {
  records: TaskRecord[];
  members: TeamMember[];
  onRemoveRecord: (recordId: string) => void;
  onOpenMemberDetails?: (member: TeamMember) => void;
}

export const DailyLog: React.FC<DailyLogProps> = ({
  records,
  members,
  onRemoveRecord,
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
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
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
        <div className="py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-zinc-50 text-zinc-400 flex items-center justify-center mx-auto mb-2">
            <CheckCheck className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-zinc-600">Nenhuma solicitação ainda hoje</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ao clicar em &quot;+1 Pedir Tarefa&quot;, os registros aparecerão aqui em ordem cronológica.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 mt-2 max-h-80 overflow-y-auto pr-1">
          {sortedRecords.map((record) => {
            const member = memberMap[record.memberId];
            const avatarColor = member?.avatarColor || '#4f46e5';
            return (
              <div
                key={record.id}
                className="py-2.5 flex items-center justify-between gap-3 group hover:bg-zinc-50/70 px-2 rounded-lg transition-colors"
              >
                <div
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  onClick={() => member && onOpenMemberDetails && onOpenMemberDetails(member)}
                  title="Clique para ver todo o histórico deste colaborador"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {getInitials(record.memberName)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-zinc-900 truncate hover:text-blue-600 transition-colors">
                        {record.memberName}
                      </p>
                      {(member?.role || record.memberRole) && (
                        <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded font-medium truncate">
                          {member?.role || record.memberRole}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1.5 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {formatTimePtBR(record.timestamp)}
                      </span>
                      {record.taskTitle && (
                        <>
                          <span className="text-zinc-300">•</span>
                          <span className="text-zinc-700 font-medium">{record.taskTitle}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveRecord(record.id)}
                  title="Desfazer este registro"
                  className="opacity-40 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
