import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Ban, 
  UserCheck, 
  Coins, 
  Check, 
  X,
  ShieldCheck,
  UserX
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

export const UserManagement = () => {
  const { user: currentSessionUser } = useAuth();
  const { 
    users, 
    plans,
    adminSetUserCredits, 
    adminAddUserCredits, 
    adminSetUserBan, 
    adminSetUserPlan, 
    adminDeleteUser,
    adminResetUserCredits
  } = useDatabase();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state
  const [editingUser, setEditingUser] = useState(null); // User object currently editing
  const [editCredits, setEditCredits] = useState('');
  const [editPlan, setEditPlan] = useState('');
  
  // Custom bonus credit state
  const [bonusUser, setBonusUser] = useState(null);
  const [bonusAmount, setBonusAmount] = useState('');

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setEditCredits(u.credits?.toString() || '0');
    setEditPlan(u.plan || 'Free');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    adminSetUserCredits(editingUser.id, editCredits);
    adminSetUserPlan(editingUser.id, editPlan);

    showToast(`User settings for ${editingUser.name} updated successfully!`, 'success');
    setEditingUser(null);
  };

  const handleAddBonusCredits = (e) => {
    e.preventDefault();
    if (!bonusUser || !bonusAmount) return;

    adminAddUserCredits(bonusUser.id, bonusAmount);
    showToast(`Injected +${bonusAmount} bonus credits to ${bonusUser.name}'s wallet.`, 'success');
    setBonusUser(null);
    setBonusAmount('');
  };

  const handleToggleBan = (u) => {
    if (u.id === currentSessionUser.id) {
      showToast('You cannot ban your own active session!', 'warning');
      return;
    }
    const nextBanState = !u.is_banned;
    adminSetUserBan(u.id, nextBanState);
    showToast(nextBanState ? `${u.name} has been banned.` : `${u.name} has been unbanned.`, nextBanState ? 'error' : 'success');
  };

  const handleDeleteUser = (u) => {
    if (u.id === currentSessionUser.id) {
      showToast('You cannot delete your own admin account!', 'warning');
      return;
    }
    if (confirm(`Are you absolutely sure you want to delete ${u.name}'s account? This will wipe all their generation history permanently.`)) {
      adminDeleteUser(u.id);
      showToast(`${u.name} has been deleted from user registry.`, 'info');
    }
  };

  const handleResetCredits = (u) => {
    adminResetUserCredits(u.id);
    showToast(`Credits for ${u.name} reset to their standard plan defaults.`, 'info');
  };

  // Filter users based on search
  const filteredUsers = users.filter(u => {
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide">Platform Account Management</h2>
          <p className="text-xs text-gray-400 mt-1">
            Browse through registered users, manage wallet credit balances, switch subscription plans, and toggle account suspensions.
          </p>
        </div>
      </div>

      {/* Search Header Tool */}
      <div className="glass-panel rounded-2xl border-purple-500/15 p-4 shadow-lg flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-1.5 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
          />
        </div>
        <span className="text-[10px] text-gray-500 font-mono font-bold uppercase select-none">
          Registered Database: {filteredUsers.length} accounts found
        </span>
      </div>

      {/* Main Users Table */}
      <div className="glass-panel rounded-2xl border-purple-500/15 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-500/10 text-gray-500 font-bold uppercase tracking-wider select-none">
                <th className="p-4">Name / ID</th>
                <th className="p-4">Email</th>
                <th className="p-4">Credits</th>
                <th className="p-4">Plan Level</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/5 text-gray-300 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-500 leading-relaxed font-bold uppercase">
                    No accounts found matching your query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentSessionUser.id;
                  return (
                    <tr key={u.id} className={`hover:bg-purple-950/5 transition-colors ${u.is_banned ? 'bg-rose-950/5' : ''}`}>
                      {/* Name / ID */}
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-[11px] font-bold text-purple-300 shadow-inner shrink-0 uppercase select-none">
                          {u.name?.substring(0, 2) || 'AV'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-white truncate flex items-center gap-1.5">
                            {u.name}
                            {isSelf && (
                              <span className="text-[9px] bg-purple-600 border border-purple-500 text-white px-1.5 rounded-full font-black uppercase">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate font-mono mt-0.5">{u.id}</div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4 truncate max-w-[140px] font-semibold">{u.email}</td>

                      {/* Credits */}
                      <td className="p-4 font-bold text-purple-300">
                        {u.plan === 'Enterprise' ? 'Unlimited' : u.credits?.toLocaleString()}
                      </td>

                      {/* Plan level */}
                      <td className="p-4 select-none">
                        <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase border ${
                          u.plan === 'Enterprise' 
                            ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' 
                            : u.plan === 'Pro' 
                              ? 'bg-purple-950/40 border-purple-500/30 text-purple-400'
                              : 'bg-white/5 border-white/10 text-gray-400'
                        }`}>
                          {u.plan}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 select-none">
                        <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase border ${
                          u.is_banned 
                            ? 'bg-rose-950/40 border-rose-500/30 text-rose-400' 
                            : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                        }`}>
                          {u.is_banned ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right select-none">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Add bonus */}
                          <button
                            onClick={() => setBonusUser(u)}
                            title="Add bonus credits"
                            className="p-1.5 bg-white/5 hover:bg-purple-600/20 text-gray-400 hover:text-purple-300 border border-white/5 hover:border-purple-500/20 rounded-lg transition-colors cursor-pointer"
                          >
                            <Coins className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick edit */}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Edit plan & credits"
                            className="p-1.5 bg-white/5 hover:bg-indigo-600/20 text-gray-400 hover:text-indigo-300 border border-white/5 hover:border-indigo-500/20 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Ban toggler */}
                          <button
                            onClick={() => handleToggleBan(u)}
                            disabled={isSelf}
                            title={u.is_banned ? 'Unban Account' : 'Suspend Account'}
                            className={`p-1.5 border rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${u.is_banned ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/20' : 'bg-rose-950/20 border-rose-500/20 text-rose-400 hover:bg-rose-900/20'}`}
                          >
                            {u.is_banned ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete account */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={isSelf}
                            title="Delete User permanently"
                            className="p-1.5 bg-white/5 hover:bg-rose-950/30 text-gray-400 hover:text-rose-400 border border-white/5 hover:border-rose-900/30 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Edit user credits & plan */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Edit user limits: ${editingUser.name}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
            {/* Direct credit balance */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Set Credit Balance</label>
              <input
                type="number"
                required
                value={editCredits}
                onChange={(e) => setEditCredits(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/15 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Plan assignment */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">SaaS Plan Tier</label>
              <select
                value={editPlan}
                onChange={(e) => setEditPlan(e.target.value)}
                className="w-full bg-[#120a1f] border border-purple-500/15 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs text-purple-300 focus:outline-none cursor-pointer"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.plan_name}>{p.plan_name} Plan</option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => handleResetCredits(editingUser)}
                className="px-3.5 py-2 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/20 text-purple-300 rounded-xl text-xs font-bold transition-all cursor-pointer mr-auto"
              >
                Reset Default
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-3.5 py-2 bg-white/5 border border-white/10 text-gray-400 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 btn-primary text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Inject bonus credits */}
      {bonusUser && (
        <Modal
          isOpen={!!bonusUser}
          onClose={() => setBonusUser(null)}
          title={`Inject bonus: ${bonusUser.name}`}
        >
          <form onSubmit={handleAddBonusCredits} className="space-y-4 text-left">
            <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
              Add bonus credits directly onto {bonusUser.name}'s active credit balance. This will increase their balance instantly.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Bonus Credits Amount</label>
              <input
                type="number"
                required
                placeholder="e.g. 100"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/15 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBonusUser(null)}
                className="px-3.5 py-2 bg-white/5 border border-white/10 text-gray-400 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 btn-primary text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Add Bonus Credits
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};
export default UserManagement;
