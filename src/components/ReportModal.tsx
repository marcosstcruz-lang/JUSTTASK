import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Printer,
  Calendar,
  Filter,
  FileSpreadsheet,
  Users,
  Search
} from 'lucide-react';
import { TeamMember, TaskRecord } from '../types';
import {
  getCurrentMonthKey,
  formatMonthNamePtBR,
  formatDateShortPtBR,
  formatTimePtBR,
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
      if (t.dateKey) {
        mSet.add(t.dateKey.substring(0, 7));
      }
    });
    return Array.from(mSet).sort().reverse();
  }, [allTasks]);

  // Member map
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
      .filter((t) => {
        // Month filter
        if (selectedMonth !== 'all' && !t.dateKey.startsWith(selectedMonth)) {
          return false;
        }
        // Member filter
        if (selectedMemberId !== 'all' && t.memberId !== selectedMemberId) {
          return false;
        }
        // Role filter
        const member = memberMap[t.memberId];
        const role = member?.role || t.memberRole || '';
        if (selectedRole !== 'all' && role !== selectedRole) {
          return false;
        }
        // Search term filter
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          const nameMatch = t.memberName.toLowerCase().includes(s);
          const taskMatch = (t.taskTitle || '').toLowerCase().includes(s);
          const roleMatch = role.toLowerCase().includes(s);
          if (!nameMatch && !taskMatch && !roleMatch) return false;
        }
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [allTasks, selectedMonth, selectedMemberId, selectedRole, searchTerm, memberMap]);

  // Metrics
  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const memberCounts: Record<string, number> = {};

    filteredTasks.forEach((t) => {
      memberCounts[t.memberName] = (memberCounts[t.memberName] || 0) + 1;
    });

    const activeCount = Object.keys(memberCounts).length;
    const avg = activeCount > 0 ? (total / activeCount).toFixed(1) : '0';

    return {
      total,
      activeCount,
      avg,
      memberCounts,
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
      ['Colaboradores Atendidos:', String(stats.activeCount)],
      ['Gerado em:', new Date().toLocaleString('pt-BR')],
      [],
      ['DATA', 'HORÁRIO', 'COLABORADOR', 'FUNÇÃO', 'DEMANDA / TAREFA', 'ID REGISTRO'],
    ];

    filteredTasks.forEach((t) => {
      const member = memberMap[t.memberId];
      rows.push([
        formatDateShortPtBR(t.dateKey),
        formatTimePtBR(t.timestamp),
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
        <div className="p-5 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                Relatório de Demandas da Equipe
              </h2>
              <p className="text-xs text-zinc-500">
                Consolidação mensal e histórico de tarefas solicitadas por colaborador
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

        {/* Filters Bar */}
        <div className="p-4 bg-zinc-50/50 border-b border-zinc-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Month Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-400" />
              <span>Mês de Referência</span>
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="all">Todo o Histórico (Todos os Meses)</option>
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
              <span>Colaborador</span>
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="all">Todos os Colaboradores ({members.length})</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-zinc-400" />
              <span>Função / Cargo</span>
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
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
              <span>Buscar Demanda</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Carga, Separação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="px-5 py-3 bg-white border-b border-zinc-100 grid grid-cols-3 gap-3 text-center">
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl py-2 px-3">
            <p className="text-[11px] text-zinc-500">Total de Demandas</p>
            <p className="text-xl font-bold text-zinc-900">{stats.total}</p>
          </div>

          <div className="bg-zinc-50 border border-zinc-100 rounded-xl py-2 px-3">
            <p className="text-[11px] text-zinc-500">Pessoas Solicitadas</p>
            <p className="text-xl font-bold text-blue-600">{stats.activeCount}</p>
          </div>

          <div className="bg-zinc-50 border border-zinc-100 rounded-xl py-2 px-3">
            <p className="text-[11px] text-zinc-500">Média por Pessoa</p>
            <p className="text-xl font-bold text-emerald-600">{stats.avg}</p>
          </div>
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
                    <th className="py-2.5 px-3">Horário</th>
                    <th className="py-2.5 px-3">Colaborador</th>
                    <th className="py-2.5 px-3">Função</th>
                    <th className="py-2.5 px-3">Demanda / Atividade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredTasks.map((task) => {
                    const member = memberMap[task.memberId];
                    return (
                      <tr key={task.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-2 px-3 font-medium text-zinc-900 whitespace-nowrap">
                          {formatDateShortPtBR(task.dateKey)}
                        </td>
                        <td className="py-2 px-3 text-zinc-500 whitespace-nowrap">
                          {formatTimePtBR(task.timestamp)}
                        </td>
                        <td className="py-2 px-3 font-bold text-zinc-900">
                          {task.memberName}
                        </td>
                        <td className="py-2 px-3 text-zinc-600 whitespace-nowrap">
                          <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md text-[11px]">
                            {member?.role || task.memberRole || 'Operacional'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-zinc-800">
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
