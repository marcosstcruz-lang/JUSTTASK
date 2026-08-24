import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Printer,
  Calendar,
  Filter,
  FileSpreadsheet,
  Users,
  Search,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';
import { TeamMember, TaskRecord } from '../types';
import {
  getCurrentMonthKey,
  formatMonthNamePtBR,
  formatDateShortPtBR,
  formatTimePtBR,
  formatDurationPtBR,
  downloadCSV,
} from '../utils/helpers';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: TeamMember[];
  allTasks: TaskRecord[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  members,
  allTasks,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract distinct roles from team members
  const roles = useMemo(() => {
    const rSet = new Set<string>();
    members.forEach((m) => {
      if (m.role) rSet.add(m.role);
    });
    return Array.from(rSet);
  }, [members]);

  // Extract distinct months present in tasks + current month
  const availableMonths = useMemo(() => {
    const mSet = new Set<string>();
    mSet.add(getCurrentMonthKey());
    allTasks.forEach((t) => {
      const monthKey = t.dateKey.substring(0, 7);
      mSet.add(monthKey);
    });
    return Array.from(mSet).sort().reverse();
  }, [allTasks]);

  // Member map for quick lookup
  const memberMap = useMemo(() => {
    const map: Record<string, TeamMember> = {};
    members.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [members]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return allTasks
      .filter((task) => {
        // Month filter
        if (selectedMonth !== 'all') {
          const taskMonth = task.dateKey.substring(0, 7);
          if (taskMonth !== selectedMonth) return false;
        }

        // Member filter
        if (selectedMemberId !== 'all' && task.memberId !== selectedMemberId) {
          return false;
        }

        // Role filter
        if (selectedRole !== 'all') {
          const member = memberMap[task.memberId];
          const role = member?.role || task.memberRole || '';
          if (role !== selectedRole) return false;
        }

        // Search term (name or task title)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const nameMatch = task.memberName.toLowerCase().includes(q);
          const titleMatch = (task.taskTitle || '').toLowerCase().includes(q);
          if (!nameMatch && !titleMatch) return false;
        }

        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [allTasks, selectedMonth, selectedMemberId, selectedRole, searchTerm, memberMap]);

  // Aggregated Stats
  const stats = useMemo(() => {
    const countByMember: Record<string, number> = {};
    let completedCount = 0;
    let inProgressCount = 0;

    filteredTasks.forEach((t) => {
      countByMember[t.memberName] = (countByMember[t.memberName] || 0) + 1;
      const isInProg = t.status === 'in_progress' || (!t.completedAt && t.status !== 'completed');
      if (isInProg) {
        inProgressCount++;
      } else {
        completedCount++;
      }
    });

    return {
      total: filteredTasks.length,
      completedCount,
      inProgressCount,
      activeCount: Object.keys(countByMember).length,
      byMember: countByMember,
    };
  }, [filteredTasks]);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    const monthLabel = selectedMonth === 'all' ? 'Todo o Período' : formatMonthNamePtBR(selectedMonth);
    const filterMemberLabel =
      selectedMemberId === 'all'
        ? 'Todos os Colaboradores'
        : memberMap[selectedMemberId]?.name || selectedMemberId;
    const filterRoleLabel = selectedRole === 'all' ? 'Todas as Funções' : selectedRole;

    const rows: string[][] = [
      ['RELATÓRIO MENSAL DE DEMANDAS E TAREFAS - DISTRIBUIÇÃO JUSTA'],
      ['Mês / Período:', monthLabel],
      ['Filtro Colaborador:', filterMemberLabel],
      ['Filtro Função:', filterRoleLabel],
      ['Total de Demandas no Relatório:', String(filteredTasks.length)],
      ['Demandas Concluídas:', String(stats.completedCount)],
      ['Demandas Em Andamento:', String(stats.inProgressCount)],
      ['Colaboradores Atendidos:', String(stats.activeCount)],
      ['Gerado em:', new Date().toLocaleString('pt-BR')],
      [],
      ['DATA', 'INÍCIO', 'TÉRMINO', 'DURAÇÃO', 'STATUS', 'COLABORADOR', 'FUNÇÃO', 'DEMANDA / TAREFA', 'ID REGISTRO'],
    ];

    filteredTasks.forEach((t) => {
      const member = memberMap[t.memberId];
      const isInProg = t.status === 'in_progress' || (!t.completedAt && t.status !== 'completed');
      rows.push([
        formatDateShortPtBR(t.dateKey),
        formatTimePtBR(t.timestamp),
        t.completedAt ? formatTimePtBR(t.completedAt) : 'Em andamento',
        formatDurationPtBR(t.timestamp, t.completedAt),
        isInProg ? 'Em Andamento' : 'Concluída',
        t.memberName,
        member?.role || t.memberRole || 'Operacional',
        t.taskTitle || 'Demanda solicitada',
        t.id,
      ]);
    });

    const filename = `relatorio_demandas_${selectedMonth}_${
      selectedMemberId !== 'all' ? 'colaborador' : 'equipe'
    }.csv`;
    downloadCSV(filename, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-zinc-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 bg-zinc-50/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 leading-tight">
                Relatório Mensal de Demandas da Equipe
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Consulte, filtre e exporte todas as tarefas solicitadas ao longo do mês.
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

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-zinc-100 bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Month Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-400" />
              <span>Mês de Referência:</span>
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="all">Todo o Histórico</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthNamePtBR(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Member Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 mb-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-zinc-400" />
              <span>Colaborador:</span>
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="all">Todos os Colaboradores</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role || 'Sem função'})
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-zinc-400" />
              <span>Função / Setor:</span>
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="all">Todas as Funções</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Search Term */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 mb-1 flex items-center gap-1">
              <Search className="w-3 h-3 text-zinc-400" />
              <span>Buscar Tarefa ou Nome:</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Separação, Carlos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Summary Metric Chips */}
        <div className="bg-zinc-50/70 border-b border-zinc-200/80 px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-zinc-800">
              <strong>{stats.total}</strong> demandas totais
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {stats.completedCount} Concluídas
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-amber-700 font-semibold flex items-center gap-1">
              <PlayCircle className="w-3.5 h-3.5" />
              {stats.inProgressCount} Em andamento
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-600">
              <strong>{stats.activeCount}</strong> colaboradores atendidos
            </span>
          </div>

          {selectedMonth !== 'all' && (
            <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
              {formatMonthNamePtBR(selectedMonth)}
            </span>
          )}
        </div>

        {/* Table Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-zinc-700">Nenhum registro encontrado para este filtro.</p>
              <p className="text-xs text-zinc-400 mt-1">
                Tente selecionar outro mês ou verificar se há demandas cadastradas.
              </p>
            </div>
          ) : (
            <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs text-zinc-700 border-collapse">
                <thead className="bg-zinc-100 text-zinc-600 uppercase font-semibold text-[10px] tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Início / Fim</th>
                    <th className="py-2.5 px-3">Duração</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Colaborador</th>
                    <th className="py-2.5 px-3">Função</th>
                    <th className="py-2.5 px-3">Demanda / Atividade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredTasks.map((task) => {
                    const member = memberMap[task.memberId];
                    const isInProg = task.status === 'in_progress' || (!task.completedAt && task.status !== 'completed');
                    return (
                      <tr key={task.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-2 px-3 font-medium text-zinc-900 whitespace-nowrap">
                          {formatDateShortPtBR(task.dateKey)}
                        </td>
                        <td className="py-2 px-3 text-zinc-500 whitespace-nowrap">
                          {formatTimePtBR(task.timestamp)}
                          {task.completedAt ? ` → ${formatTimePtBR(task.completedAt)}` : ''}
                        </td>
                        <td className="py-2 px-3 text-zinc-600 whitespace-nowrap font-medium">
                          {formatDurationPtBR(task.timestamp, task.completedAt)}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {isInProg ? (
                            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                              Em Andamento
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                              Concluída
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-bold text-zinc-900">
                          {task.memberName}
                        </td>
                        <td className="py-2 px-3 text-zinc-600 whitespace-nowrap">
                          <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md text-[11px]">
                            {member?.role || task.memberRole || 'Operacional'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-zinc-800 font-medium">
                          {task.taskTitle || 'Demanda solicitada'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer with Export Actions */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-zinc-500">
            Mostrando <strong>{filteredTasks.length}</strong> demandas registradas
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredTasks.length === 0}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel (CSV)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
