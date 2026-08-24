import React, { useState, useEffect } from 'react';
import { X, Check, Plus, ListFilter, AlertCircle, Settings2, Sparkles } from 'lucide-react';
import { TeamMember, PredefinedTask } from '../types';
import { getInitials } from '../utils/helpers';

interface AssignTaskModalProps {
  isOpen: boolean;
  member: TeamMember | null;
  tasks: PredefinedTask[];
  onClose: () => void;
  onConfirm: (memberId: string, memberName: string, taskTitle: string, notes?: string) => void;
  onOpenManageTasks: () => void;
  onQuickAddNewTask: (title: string) => void;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  isOpen,
  member,
  tasks,
  onClose,
  onConfirm,
  onOpenManageTasks,
  onQuickAddNewTask,
}) => {
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newTaskInput, setNewTaskInput] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (tasks.length > 0) {
        setSelectedTaskTitle(tasks[0].title);
      } else {
        setSelectedTaskTitle('');
      }
      setNotes('');
      setIsAddingNew(false);
      setNewTaskInput('');
      setError('');
    }
  }, [isOpen, tasks]);

  if (!isOpen || !member) return null;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskInput.trim();
    if (!trimmed) {
      setError('Informe o nome da nova tarefa para cadastrar.');
      return;
    }

    onQuickAddNewTask(trimmed);
    setSelectedTaskTitle(trimmed);
    setNewTaskInput('');
    setIsAddingNew(false);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = selectedTaskTitle.trim();
    if (!finalTitle) {
      setError('Por favor, selecione uma tarefa na lista suspensa.');
      return;
    }

    onConfirm(member.id, member.name, finalTitle, notes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-zinc-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0"
              style={{ backgroundColor: member.avatarColor }}
            >
              {getInitials(member.name)}
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 leading-tight">
                Solicitar Tarefa
              </h2>
              <p className="text-xs text-zinc-500">
                Para: <span className="font-semibold text-zinc-800">{member.name}</span> ({member.role})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Dropdown Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="task-select-dropdown" className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <ListFilter className="w-3.5 h-3.5 text-blue-600" />
                <span>Selecione a Tarefa (Lista Suspensa):</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenManageTasks();
                }}
                className="text-[11px] font-medium text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Settings2 className="w-3 h-3" />
                <span>Gerenciar lista</span>
              </button>
            </div>

            {tasks.length > 0 ? (
              <div className="relative">
                <select
                  id="task-select-dropdown"
                  value={selectedTaskTitle}
                  onChange={(e) => {
                    setSelectedTaskTitle(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer shadow-2xs appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25em 1.25em',
                    paddingRight: '2.5rem',
                  }}
                >
                  {tasks.map((task) => (
                    <option key={task.id} value={task.title}>
                      {task.title} {task.category ? `[${task.category}]` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                Nenhuma tarefa cadastrada. Cadastre uma tarefa abaixo para continuar.
              </div>
            )}
          </div>

          {/* Inline Quick Add New Task if not in dropdown */}
          {!isAddingNew ? (
            <div>
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Cadastrar nova opção nesta lista suspensa</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <label className="text-[11px] font-bold text-blue-900 block">
                Cadastrar Nova Tarefa no Catálogo:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Nome da nova tarefa..."
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewTaskInput('');
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-700 px-1 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Optional notes / details */}
          <div>
            <label htmlFor="task-notes-input" className="block text-xs font-semibold text-zinc-700 mb-1">
              Observação / Complemento (Opcional)
            </label>
            <input
              id="task-notes-input"
              type="text"
              placeholder="Ex: Doca 04, Lote 58, Setor de Devolução..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-assign-task"
              type="submit"
              disabled={!selectedTaskTitle && !newTaskInput}
              className="px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar e Atribuir</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
