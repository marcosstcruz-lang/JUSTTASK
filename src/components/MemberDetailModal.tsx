import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Download,
  Briefcase,
  Layers,
  FileText,
  Settings2,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';
import { TeamMember, TaskRecord, PredefinedTask } from '../types';
import {
  getInitials,
  formatTimePtBR,
  formatDatePtBR,
  formatDateShortPtBR,
  formatDurationPtBR,
  formatTimeElapsedPtBR,
  getTodayDateKey,
  downloadCSV,
} from '../utils/helpers';

interface MemberDetailModalProps {
  member: TeamMember | null;
  allTasks: TaskRecord[];
  tasksList: PredefinedTask[];
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (memberId: string, memberName: string, taskTitle: string, notes?: string) => void;
  onCompleteTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
  onOpenManageTasks: () => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  allTasks,
  tasksList,
  isOpen,
  onClose,
  onAddTask,
  onCompleteTask,
  onRemoveTask,
  onOpenManageTasks,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateKey());
  const [viewAllDates, setViewAllDates] = useState(false);
  const [dropdownTask, setDropdownTask] = useState<string>('');
  const [customDemand, setCustomDemand] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  React.useEffect(() => {
    if (tasksList.length > 0) {
      setDropdownTask(tasksList[0].title);
    }
  }, [tasksList]);

  if (!isOpen || !member) return null;

  // Filter tasks for this member
  const memberTasks = useMemo(() => {
    return allTasks.filter((t) => t.memberId === member.id);
  }, [allTasks, member.id]);

  // Filtered by selected date or all
  const displayedTasks = useMemo(() => {
    if (viewAllDates) {
      return [...memberTasks].sort((a, b) => b.timestamp - a.timestamp);
    }
    return memberTasks
      .filter((t) => t.dateKey === selectedDate)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [memberTasks, selectedDate, viewAllDates]);

  // Tasks today count and active task
  const todayKey = getTodayDateKey();
  const tasksToday = memberTasks.filter((t) => t.dateKey === todayKey);
  const tasksTodayCount = tasksToday.length;
  const activeTaskToday = tasksToday.find(
    (t) => t.status === 'in_progress' || (!t.completedAt && t.status !== 'completed')
  );
  const totalTasksCount = memberTasks.length;

  const handleCreateTask = (demandTitle: string) => {
    if (!demandTitle.trim()) return;
    onAddTask(member.id, member.name, demandTitle.trim());
    setCustomDemand('');
    setIsAddingCustom(false);
  };

  const handleExportCollaboratorReport = () => {
    const rows = [
      ['RELATÓRIO DE DEMANDAS DO COLABORADOR'],
      ['Colaborador:', member.name],
      ['Função:', member.role || 'Não especificada'],
      ['Total de Demandas Registradas:', String(memberTasks.length)],
      ['Data de Emissão:', new Date().toLocaleString('pt-BR')],
      [],
      ['DATA', 'INÍCIO', 'TÉRMINO', 'DURAÇÃO', 'STATUS', 'DEMANDA / ATIVIDADE', 'CÓDIGO REGISTRO'],
    ];

    const sorted = [...memberTasks].sort((a, b) => b.timestamp - a.timestamp);
    sorted.forEach((t) => {
      const isInProg = t.status === 'in_progress' || (!t.completedAt && t.status !== 'completed');
      rows.push([
        formatDateShortPtBR(t.dateKey),
        formatTimePtBR(t.timestamp),
        t.completedAt ? formatTimePtBR(t.completedAt) : 'Em andamento',
        formatDurationPtBR(t.timestamp, t.completedAt),
        isInProg ? 'Em Andamento' : 'Concluída',
        t.taskTitle || 'Demanda solicitada (padrão)',
        t.id,
      ]);
    });

    const safeName = member.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    downloadCSV(`relatorio_${safeName}_demandas.csv`, rows);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-zinc-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-xs relative"
              style={{ backgroundColor: member.avatarColor }}
            >
              {getInitials(member.name)}
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  !member.available
                    ? 'bg-zinc-400'
                    : activeTaskToday
                    ? 'bg-amber-500 ring-1 ring-amber-300'
                    : 'bg-emerald-500 ring-1 ring-emerald-300'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 leading-snug">
                  {member.name}
                </h2>
                {!member.available ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-600">
                    Ausente
                  </span>
                ) : activeTaskToday ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Em Tarefa
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ● Disponível
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-medium text-zinc-700">{member.role}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Active Task Banner if currently executing one */}
          {activeTaskToday && (
            <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-amber-600 animate-pulse" />
                  Tarefa Atual em Andamento:
                </span>
                <p className="text-sm font-bold text-zinc-900 mt-1">
                  {activeTaskToday.taskTitle || 'Demanda solicitada'}
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Iniciada às {formatTimePtBR(activeTaskToday.timestamp)} ({formatTimeElapsedPtBR(activeTaskToday.timestamp)})
                </p>
              </div>

              <button
                type="button"
                onClick={() => onCompleteTask(activeTaskToday.id)}
                className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Encerrar Tarefa Agora</span>
              </button>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3">
              <p className="text-[11px] font-medium text-blue-700">Demandas Hoje</p>
              <p className="text-2xl font-bold text-blue-900 mt-0.5">{tasksTodayCount}</p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
              <p className="text-[11px] font-medium text-zinc-600">Total Histórico</p>
              <p className="text-2xl font-bold text-zinc-900 mt-0.5">{totalTasksCount}</p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex flex-col justify-between">
              <p className="text-[11px] font-medium text-zinc-600">Exportar Dados</p>
              <button
                type="button"
                onClick={handleExportCollaboratorReport}
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          {/* New Task / Demand Section */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                  Atribuir Nova Demanda para {member.name.split(' ')[0]}
                </h4>
              </div>

              <button
                type="button"
                onClick={onOpenManageTasks}
                className="text-[11px] font-medium text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Settings2 className="w-3 h-3" />
                <span>Gerenciar tarefas</span>
              </button>
            </div>

            {/* Dropdown Selection */}
            <div>
              <label htmlFor="modal-task-select" className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Selecionar na Lista Suspensa:
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="modal-task-select"
                  value={dropdownTask}
                  onChange={(e) => setDropdownTask(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
                >
                  {tasksList.map((t) => (
                    <option key={t.id} value={t.title}>
                      {t.title} {t.category ? `(${t.category})` : ''}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleCreateTask(dropdownTask || 'Demanda solicitada')}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+1 Atribuir</span>
                </button>
              </div>
            </div>

            {/* Quick preset chips */}
            {tasksList.length > 0 && (
              <div>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1.5">
                  Atalhos Rápidos:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tasksList.slice(0, 6).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => handleCreateTask(task.title)}
                      className="bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-zinc-200 text-zinc-700 text-[11px] px-2.5 py-1 rounded-lg transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      + {task.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Demand Form */}
            {isAddingCustom ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateTask(customDemand);
                }}
                className="flex items-center gap-2 pt-1 border-t border-zinc-200/60"
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="Digite a descrição da tarefa personalizada..."
                  value={customDemand}
                  onChange={(e) => setCustomDemand(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <button
                  type="submit"
                  disabled={!customDemand.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-700 px-2 py-2 cursor-pointer"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="text-[11px] text-zinc-500 hover:text-blue-600 hover:underline cursor-pointer"
                >
                  + Digitar outra tarefa personalizada não listada
                </button>
              </div>
            )}
          </div>

          {/* Activity History Filter and List */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-600" />
                <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                  Histórico de Solicitações
                </h4>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setViewAllDates(false)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    !viewAllDates
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-zinc-500 hover:bg-zinc-100'
                  }`}
                >
                  Dia Selecionado
                </button>
                <button
                  type="button"
                  onClick={() => setViewAllDates(true)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    viewAllDates
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-zinc-500 hover:bg-zinc-100'
                  }`}
                >
                  Todo o Período
                </button>

                {!viewAllDates && (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-700 bg-white"
                  />
                )}
              </div>
            </div>

            {/* List */}
            {displayedTasks.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-zinc-700">
                  Nenhuma solicitação registrada{' '}
                  {viewAllDates ? 'no histórico' : `para ${formatDateShortPtBR(selectedDate)}`}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Clique nos botões acima para registrar o que {member.name.split(' ')[0]} fez.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto pr-1 mt-2">
                {displayedTasks.map((t) => {
                  const isInProg = t.status === 'in_progress' || (!t.completedAt && t.status !== 'completed');
                  return (
                    <div
                      key={t.id}
                      className={`py-2.5 px-2 flex items-center justify-between gap-3 group rounded-lg transition-colors ${
                        isInProg ? 'bg-amber-50/50 hover:bg-amber-50/80' : 'hover:bg-zinc-50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-900 truncate">
                            {t.taskTitle || 'Demanda solicitada'}
                          </span>
                          {isInProg ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Em Andamento
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              Concluída ({formatDurationPtBR(t.timestamp, t.completedAt)})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            {formatDatePtBR(t.dateKey)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            Início: {formatTimePtBR(t.timestamp)}
                            {t.completedAt ? ` / Fim: ${formatTimePtBR(t.completedAt)}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isInProg && (
                          <button
                            type="button"
                            onClick={() => onCompleteTask(t.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Encerrar</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onRemoveTask(t.id)}
                          title="Excluir este registro"
                          className="p-1.5 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
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
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            {displayedTasks.length} {displayedTasks.length === 1 ? 'registro exibido' : 'registros exibidos'}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
