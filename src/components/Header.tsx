import React from 'react';
import { Users, Plus, RotateCcw, Calendar, FileSpreadsheet, CheckSquare } from 'lucide-react';
import { formatDatePtBR } from '../utils/helpers';

interface HeaderProps {
  currentDateKey: string;
  totalTasksToday: number;
  activeMembersCount: number;
  totalMembersCount: number;
  onOpenAddMember: () => void;
  onOpenReport: () => void;
  onOpenManageTasks: () => void;
  onResetDay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDateKey,
  totalTasksToday,
  activeMembersCount,
  totalMembersCount,
  onOpenAddMember,
  onOpenReport,
  onOpenManageTasks,
  onResetDay,
}) => {
  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
          {/* Brand & Date */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 leading-tight">
                Distribuidor Justo de Tarefas
              </h1>
              <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>{formatDatePtBR(currentDateKey)}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Main Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="hidden sm:flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-700">
              <span>
                <strong>{totalTasksToday}</strong> {totalTasksToday === 1 ? 'demanda hoje' : 'demandas hoje'}
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-600">
                <strong>{activeMembersCount}</strong> de {totalMembersCount} ativos
              </span>
            </div>

            {/* Manage Tasks Button (Cadastrar e Descadastrar) */}
            <button
              id="btn-manage-tasks"
              type="button"
              onClick={onOpenManageTasks}
              className="inline-flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 border border-zinc-200 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer"
              title="Cadastrar e descadastrar tipos de tarefas disponíveis na lista suspensa"
            >
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span>Tarefas Cadastradas</span>
            </button>

            {/* Monthly Report Button */}
            <button
              id="btn-open-report"
              type="button"
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer"
              title="Exportar relatório mensal por colaborador ou equipe"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Relatório Mensal</span>
            </button>

            {/* Add Member Button */}
            <button
              id="btn-add-member"
              type="button"
              onClick={onOpenAddMember}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Colaborador</span>
            </button>

            {/* Reset Day */}
            {totalTasksToday > 0 && (
              <button
                id="btn-reset-day"
                type="button"
                onClick={onResetDay}
                title="Zerar a contagem de tarefas de hoje"
                className="inline-flex items-center gap-1 bg-zinc-100 hover:bg-red-50 hover:text-red-700 text-zinc-600 text-xs font-medium px-2.5 py-2 rounded-xl transition-colors border border-zinc-200 hover:border-red-200 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Zerar Dia</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
