import React, { useState } from 'react';
import { X, Plus, Trash2, CheckSquare, Sparkles, RotateCcw, Tag } from 'lucide-react';
import { PredefinedTask } from '../types';
import { INITIAL_PREDEFINED_TASKS } from '../data/defaultTasks';

interface ManageTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: PredefinedTask[];
  onAddTask: (title: string, category?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onResetToDefaults: () => void;
}

export const ManageTasksModal: React.FC<ManageTasksModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onAddTask,
  onDeleteTask,
  onResetToDefaults,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setError('Por favor, informe a descrição da tarefa.');
      return;
    }

    const exists = tasks.some(
      (t) => t.title.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setError('Esta tarefa já está cadastrada na lista.');
      return;
    }

    onAddTask(trimmed, newCategory.trim() || undefined);
    setNewTitle('');
    setNewCategory('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-zinc-100 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                Cadastrar e Gerenciar Tarefas
              </h2>
              <p className="text-xs text-zinc-500">
                Essas tarefas ficarão disponíveis na lista suspensa ao solicitar demandas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Add Form */}
          <form onSubmit={handleCreate} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Cadastrar Nova Tarefa</span>
            </h3>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="Ex: Separação de Paletes Zona B..."
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Categoria (Opcional: Ex: Logística, Armazém)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cadastrar Tarefa</span>
              </button>
            </div>
          </form>

          {/* List of Tasks */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-zinc-100">
              <span className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                Tarefas Cadastradas na Lista ({tasks.length})
              </span>

              {tasks.length === 0 && (
                <button
                  type="button"
                  onClick={onResetToDefaults}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Tarefas Padrão</span>
                </button>
              )}
            </div>

            {tasks.length === 0 ? (
              <div className="py-8 text-center bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
                <p className="text-xs font-semibold text-zinc-600">Nenhuma tarefa cadastrada na lista.</p>
                <button
                  type="button"
                  onClick={onResetToDefaults}
                  className="mt-2 text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Carregar Tarefas Recomendadas</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 max-h-60 overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="py-2 px-2.5 flex items-center justify-between gap-3 group hover:bg-zinc-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-xs font-medium text-zinc-900 truncate">
                        {task.title}
                      </span>
                      {task.category && (
                        <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded font-medium truncate">
                          {task.category}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      title="Descadastrar esta tarefa"
                      className="p-1.5 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-60 group-hover:opacity-100 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onResetToDefaults}
            className="text-[11px] text-zinc-500 hover:text-zinc-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restaurar padrões de fábrica</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
