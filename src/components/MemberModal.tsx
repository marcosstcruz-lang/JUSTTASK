import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { TeamMember } from '../types';
import { AVATAR_COLORS } from '../data/defaultMembers';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: { name: string; role: string; avatarColor: string; available: boolean }) => void;
  editingMember?: TeamMember | null;
}

const PRESET_ROLES = [
  'AUX. OPERACIONAL',
  'OP. EMPILHADEIRA',
  'CONFERENTE',
  'LÍDER OPERACIONAL',
  'SUPORTE',
];

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMember,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('AUX. OPERACIONAL');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name);
      setRole(editingMember.role || 'AUX. OPERACIONAL');
      setAvatarColor(editingMember.avatarColor);
      setAvailable(editingMember.available);
    } else {
      setName('');
      setRole('AUX. OPERACIONAL');
      const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      setAvatarColor(randomColor);
      setAvailable(true);
    }
    setError('');
  }, [editingMember, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Por favor, informe o nome do colaborador.');
      return;
    }

    onSave({
      name: trimmed.toUpperCase(),
      role: role.trim().toUpperCase() || 'AUX. OPERACIONAL',
      avatarColor,
      available,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-zinc-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-base font-bold text-zinc-900">
            {editingMember ? 'Editar Colaborador' : 'Adicionar Novo Colaborador'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="member-name-input" className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              id="member-name-input"
              type="text"
              required
              autoFocus
              placeholder="Ex: JOSÉ TIAGO VITAL"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium uppercase"
            />
          </div>

          <div>
            <label htmlFor="member-role-select" className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Função / Cargo
            </label>
            <input
              id="member-role-input"
              type="text"
              placeholder="Ex: OP. EMPILHADEIRA ou AUX. OPERACIONAL"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium uppercase mb-2"
            />
            {/* Quick role suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ROLES.map((pr) => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => setRole(pr)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    role === pr
                      ? 'bg-blue-100 text-blue-800 border-blue-300 font-semibold'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                  }`}
                >
                  {pr}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">
              Cor do Avatar
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  style={{ backgroundColor: color }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-transform active:scale-95 cursor-pointer shadow-2xs"
                >
                  {avatarColor === color && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-800 block">Disponibilidade</span>
              <span className="text-[11px] text-zinc-500">
                Pessoas ausentes não são sugeridas nas tarefas
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAvailable(!available)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                available
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {available ? 'Disponível' : 'Ausente'}
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {editingMember ? 'Salvar Alterações' : 'Adicionar Colaborador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
