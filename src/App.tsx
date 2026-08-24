/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { TeamMember, TaskRecord, PredefinedTask } from './types';
import { INITIAL_MEMBERS } from './data/defaultMembers';
import { INITIAL_PREDEFINED_TASKS } from './data/defaultTasks';
import { getTodayDateKey } from './utils/helpers';
import { Header } from './components/Header';
import { NextSuggestionBanner } from './components/NextSuggestionBanner';
import { MemberCard } from './components/MemberCard';
import { DailyLog } from './components/DailyLog';
import { BalanceOverview } from './components/BalanceOverview';
import { MemberModal } from './components/MemberModal';
import { MemberDetailModal } from './components/MemberDetailModal';
import { ReportModal } from './components/ReportModal';
import { ConfirmModal } from './components/ConfirmModal';
import { AssignTaskModal } from './components/AssignTaskModal';
import { ManageTasksModal } from './components/ManageTasksModal';
import { Users, Info, Check, Search } from 'lucide-react';

const STORAGE_MEMBERS_KEY = 'equipe_distribuidor_membros_v2';
const STORAGE_ALL_TASKS_KEY = 'equipe_distribuidor_todas_tarefas_v2';
const STORAGE_TASKS_CATALOG_KEY = 'equipe_distribuidor_tarefas_catalogo_v2';

export default function App() {
  const currentDateKey = useMemo(() => getTodayDateKey(), []);

  // Team members state with localStorage
  const [members, setMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MEMBERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_MEMBERS;
  });

  // All tasks history state with localStorage
  const [allTasks, setAllTasks] = useState<TaskRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ALL_TASKS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [];
  });

  // Predefined Task catalog state with localStorage
  const [predefinedTasks, setPredefinedTasks] = useState<PredefinedTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TASKS_CATALOG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_PREDEFINED_TASKS;
  });

  // Role Tab Filter ('all' or specific role like 'OP. EMPILHADEIRA', 'AUX. OPERACIONAL')
  const [activeTabRole, setActiveTabRole] = useState<string>('all');
  const [searchMemberQuery, setSearchMemberQuery] = useState<string>('');

  // Modals
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const [selectedMemberForDetails, setSelectedMemberForDetails] = useState<TeamMember | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isManageTasksModalOpen, setIsManageTasksModalOpen] = useState(false);
  const [assignTaskTargetMember, setAssignTaskTargetMember] = useState<TeamMember | null>(null);

  // Confirm Modal
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(members));
    } catch {
      // ignore
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ALL_TASKS_KEY, JSON.stringify(allTasks));
    } catch {
      // ignore
    }
  }, [allTasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TASKS_CATALOG_KEY, JSON.stringify(predefinedTasks));
    } catch {
      // ignore
    }
  }, [predefinedTasks]);

  // Distinct roles from team members
  const availableRoles = useMemo(() => {
    const rolesSet = new Set<string>();
    members.forEach((m) => {
      if (m.role) rolesSet.add(m.role);
    });
    return Array.from(rolesSet).sort();
  }, [members]);

  // Filtered members for display
  const displayedMembers = useMemo(() => {
    return members.filter((m) => {
      if (activeTabRole !== 'all' && m.role !== activeTabRole) {
        return false;
      }
      if (searchMemberQuery.trim()) {
        const q = searchMemberQuery.toLowerCase();
        const nameMatches = m.name.toLowerCase().includes(q);
        const roleMatches = (m.role || '').toLowerCase().includes(q);
        if (!nameMatches && !roleMatches) return false;
      }
      return true;
    });
  }, [members, activeTabRole, searchMemberQuery]);

  // Tasks of today
  const todayTasks = useMemo(() => {
    return allTasks.filter((t) => t.dateKey === currentDateKey);
  }, [allTasks, currentDateKey]);

  // Today's task count map per member
  const memberTodayCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    members.forEach((m) => {
      map[m.id] = 0;
    });
    todayTasks.forEach((t) => {
      if (map[t.memberId] !== undefined) {
        map[t.memberId] += 1;
      }
    });
    return map;
  }, [members, todayTasks]);

  // Today's last task time per member
  const memberLastTaskMap = useMemo(() => {
    const map: Record<string, number> = {};
    todayTasks.forEach((t) => {
      if (!map[t.memberId] || t.timestamp > map[t.memberId]) {
        map[t.memberId] = t.timestamp;
      }
    });
    return map;
  }, [todayTasks]);

  // Max tasks in team today
  const maxTasksInTeam = useMemo(() => {
    const counts: number[] = Object.values(memberTodayCountMap);
    return counts.length > 0 ? Math.max(...counts) : 0;
  }, [memberTodayCountMap]);

  // Suggested member id in current tab
  const suggestedMemberId = useMemo(() => {
    const tabMembers = members.filter((m) =>
      activeTabRole === 'all' ? true : m.role === activeTabRole
    );
    const active = tabMembers.filter((m) => m.available);
    if (active.length === 0) return null;

    let min = Infinity;
    active.forEach((m) => {
      const c = memberTodayCountMap[m.id] || 0;
      if (c < min) min = c;
    });

    const candidates = active.filter((m) => (memberTodayCountMap[m.id] || 0) === min);
    const sorted = candidates.sort((a, b) => {
      return (memberLastTaskMap[a.id] || 0) - (memberLastTaskMap[b.id] || 0);
    });

    return sorted[0]?.id || null;
  }, [members, activeTabRole, memberTodayCountMap, memberLastTaskMap]);

  // Actions for Task Assignment
  const handleOpenAssignModal = (member: TeamMember) => {
    setAssignTaskTargetMember(member);
  };

  const handleAssignTask = (
    memberId: string,
    memberName: string,
    taskTitle?: string,
    notes?: string
  ) => {
    const member = members.find((m) => m.id === memberId);
    const finalTitle = taskTitle || (predefinedTasks[0]?.title ?? 'Demanda solicitada');
    const newRecord: TaskRecord = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      memberId,
      memberName,
      memberRole: member?.role,
      timestamp: Date.now(),
      dateKey: currentDateKey,
      taskTitle: finalTitle,
      notes: notes || undefined,
    };

    setAllTasks((prev) => [newRecord, ...prev]);
    showToast(`Tarefa "${finalTitle}" atribuída para ${memberName}`);
  };

  const handleDecrementTask = (memberId: string) => {
    // Remove the latest task for this member today
    const memberTodayTasks = todayTasks.filter((t) => t.memberId === memberId);
    if (memberTodayTasks.length === 0) return;

    const latestTask = [...memberTodayTasks].sort((a, b) => b.timestamp - a.timestamp)[0];
    setAllTasks((prev) => prev.filter((t) => t.id !== latestTask.id));
    showToast(`1 demanda removida de hoje`);
  };

  const handleRemoveSingleRecord = (recordId: string) => {
    setAllTasks((prev) => prev.filter((t) => t.id !== recordId));
    showToast(`Registro removido do histórico`);
  };

  const handleToggleAvailability = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextState = !m.available;
          showToast(`${m.name} marcado como ${nextState ? 'Disponível' : 'Ausente'}`);
          return { ...m, available: nextState };
        }
        return m;
      })
    );
  };

  // Task Catalog Management (Cadastrar e Descadastrar tarefas)
  const handleAddTaskType = (title: string, category?: string) => {
    const newTask: PredefinedTask = {
      id: `task-def-${Date.now()}`,
      title: title.trim(),
      category: category?.trim() || undefined,
      createdAt: Date.now(),
    };
    setPredefinedTasks((prev) => [...prev, newTask]);
    showToast(`Tarefa "${title}" cadastrada na lista suspensa com sucesso!`);
  };

  const handleDeleteTaskType = (taskId: string) => {
    const taskToDelete = predefinedTasks.find((t) => t.id === taskId);
    setPredefinedTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (taskToDelete) {
      showToast(`Tarefa "${taskToDelete.title}" descadastrada da lista`);
    }
  };

  const handleResetTaskTypes = () => {
    setPredefinedTasks(INITIAL_PREDEFINED_TASKS);
    showToast(`Lista de tarefas restaurada com os padrões`);
  };

  const handleSaveMember = (data: {
    name: string;
    role: string;
    avatarColor: string;
    available: boolean;
  }) => {
    if (editingMember) {
      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember.id ? { ...m, ...data } : m))
      );
      // Update name & role in historical task records
      setAllTasks((prev) =>
        prev.map((t) =>
          t.memberId === editingMember.id
            ? { ...t, memberName: data.name, memberRole: data.role }
            : t
        )
      );
      showToast(`Colaborador ${data.name} atualizado`);
    } else {
      const newMember: TeamMember = {
        id: `m-${Date.now()}`,
        name: data.name,
        role: data.role,
        avatarColor: data.avatarColor,
        available: data.available,
        createdAt: Date.now(),
      };
      setMembers((prev) => [...prev, newMember]);
      showToast(`${data.name} adicionado à equipe`);
    }
  };

  const handleDeleteMember = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Colaborador',
      message: `Deseja realmente remover ${member.name} da equipe? O histórico de tarefas passadas será preservado nos relatórios.`,
      confirmLabel: 'Excluir',
      isDestructive: true,
      onConfirm: () => {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        showToast(`${member.name} removido da equipe`);
      },
    });
  };

  const handleResetDay = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Zerar Contagem de Hoje',
      message:
        'Deseja zerar as solicitações registradas no dia de hoje? Os registros de outros dias e os dados da equipe serão mantidos.',
      confirmLabel: 'Zerar Dia',
      isDestructive: true,
      onConfirm: () => {
        setAllTasks((prev) => prev.filter((t) => t.dateKey !== currentDateKey));
        showToast('Demandas de hoje zeradas com sucesso');
      },
    });
  };

  const activeMembersCount = members.filter((m) => m.available).length;

  return (
    <div className="min-h-screen bg-zinc-100/60 text-zinc-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentDateKey={currentDateKey}
        totalTasksToday={todayTasks.length}
        activeMembersCount={activeMembersCount}
        totalMembersCount={members.length}
        onOpenAddMember={() => {
          setEditingMember(null);
          setIsMemberModalOpen(true);
        }}
        onOpenManageTasks={() => setIsManageTasksModalOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
        onResetDay={handleResetDay}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Didactic Instruction Box */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-zinc-900">
                Distribuição Equilibrada e Seleção de Tarefas na Lista Suspensa
              </h2>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                • Ao clicar em <strong>&quot;+1 Pedir Tarefa&quot;</strong>, você pode <strong>selecionar a tarefa na lista suspensa</strong> ou cadastrar uma nova opção na hora.
                <br />
                • Clique em <strong>&quot;Tarefas Cadastradas&quot;</strong> no topo para cadastrar e descadastrar os tipos de tarefas da sua operação.
                <br />
                • Clique no nome de qualquer colaborador para ver o histórico individual ou em <strong>&quot;Relatório Mensal&quot;</strong> para exportar para o Excel.
              </p>
            </div>
          </div>
        </div>

        {/* Suggestion Banner based on tab */}
        <NextSuggestionBanner
          members={members}
          todayTasks={todayTasks}
          activeTabRole={activeTabRole}
          onAssignTask={handleOpenAssignModal}
        />

        {/* Role Tabs and Search Bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Dynamic Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTabRole('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTabRole === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                Todas as Funções ({members.length})
              </button>

              {availableRoles.map((role) => {
                const count = members.filter((m) => m.role === role).length;
                const isSelected = activeTabRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setActiveTabRole(role)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    {role} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar colaborador..."
                value={searchMemberQuery}
                onChange={(e) => setSearchMemberQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Members Grid */}
          <div>
            <div className="flex items-center justify-between mb-3 px-0.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-600" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Equipe {activeTabRole !== 'all' ? `• ${activeTabRole}` : ''} ({displayedMembers.length})
                </h3>
              </div>
              <span className="text-xs text-zinc-500">
                Toque no nome para abrir o histórico individual
              </span>
            </div>

            {displayedMembers.length === 0 ? (
              <div className="bg-white border border-dashed border-zinc-300 rounded-2xl p-10 text-center">
                <p className="text-sm font-semibold text-zinc-700">Nenhum colaborador encontrado nesta aba.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTabRole('all');
                    setSearchMemberQuery('');
                  }}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedMembers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    taskCount={memberTodayCountMap[member.id] || 0}
                    lastTaskTimestamp={memberLastTaskMap[member.id]}
                    maxTasksInTeam={maxTasksInTeam}
                    isSuggested={member.id === suggestedMemberId}
                    onRequestTask={handleOpenAssignModal}
                    onDecrement={handleDecrementTask}
                    onToggleAvailability={handleToggleAvailability}
                    onOpenDetails={(m) => setSelectedMemberForDetails(m)}
                    onEdit={(m) => {
                      setEditingMember(m);
                      setIsMemberModalOpen(true);
                    }}
                    onDelete={handleDeleteMember}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Diagnosis & Chronological Log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <BalanceOverview members={members} todayTasks={todayTasks} />
          <DailyLog
            records={todayTasks}
            members={members}
            onRemoveRecord={handleRemoveSingleRecord}
            onOpenMemberDetails={(m) => setSelectedMemberForDetails(m)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-4 px-6 text-center text-xs text-zinc-500 mt-auto">
        <p>Distribuidor Justo de Tarefas • Balanço Diário e Relatórios Mensais da Equipe</p>
      </footer>

      {/* Modal: Select & Assign Task via Dropdown */}
      <AssignTaskModal
        isOpen={Boolean(assignTaskTargetMember)}
        member={assignTaskTargetMember}
        tasks={predefinedTasks}
        onClose={() => setAssignTaskTargetMember(null)}
        onConfirm={handleAssignTask}
        onOpenManageTasks={() => setIsManageTasksModalOpen(true)}
        onQuickAddNewTask={(title) => handleAddTaskType(title)}
      />

      {/* Modal: Cadastrar e Descadastrar Tarefas */}
      <ManageTasksModal
        isOpen={isManageTasksModalOpen}
        onClose={() => setIsManageTasksModalOpen(false)}
        tasks={predefinedTasks}
        onAddTask={handleAddTaskType}
        onDeleteTask={handleDeleteTaskType}
        onResetToDefaults={handleResetTaskTypes}
      />

      {/* Collaborator History & Demand Modal (Clicked on Name) */}
      <MemberDetailModal
        member={selectedMemberForDetails}
        allTasks={allTasks}
        tasksList={predefinedTasks}
        isOpen={Boolean(selectedMemberForDetails)}
        onClose={() => setSelectedMemberForDetails(null)}
        onAddTask={(mId, mName, taskTitle, notes) => handleAssignTask(mId, mName, taskTitle, notes)}
        onRemoveTask={handleRemoveSingleRecord}
        onOpenManageTasks={() => {
          setSelectedMemberForDetails(null);
          setIsManageTasksModalOpen(true);
        }}
      />

      {/* Monthly Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        members={members}
        allTasks={allTasks}
      />

      {/* Add / Edit Member Modal */}
      <MemberModal
        isOpen={isMemberModalOpen}
        editingMember={editingMember}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
      />

      {/* Confirm Action Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        isDestructive={confirmConfig.isDestructive}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
