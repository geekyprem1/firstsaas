import React, { useState } from 'react';
import { 
  Tags, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Check, 
  X, 
  DollarSign, 
  Database, 
  Sparkles, 
  ListPlus,
  AlertTriangle
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import Toast from '../../components/Toast';

export const PlansPricing = () => {
  const { plans, adminUpdatePlanDetails, adminCreatePlan, adminDeletePlan } = useDatabase();
  const [toast, setToast] = useState(null);

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editCredits, setEditCredits] = useState('');
  const [editFeatures, setEditFeatures] = useState('');

  // Create new plan states
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCredits, setNewCredits] = useState('');
  const [newFeatures, setNewFeatures] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleStartEdit = (plan) => {
    setEditingId(plan.id);
    setEditPrice(plan.price.toString());
    setEditCredits(plan.credits.toString());
    setEditFeatures(plan.features.join(', '));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSavePlan = (planId) => {
    if (!editPrice || !editCredits || !editFeatures) {
      showToast('Please fill out all plan details fields.', 'warning');
      return;
    }
    
    adminUpdatePlanDetails(planId, editCredits, editPrice, editFeatures);
    setEditingId(null);
    showToast('Subscription plan details updated successfully!', 'success');
  };

  const handleCreatePlan = (e) => {
    e.preventDefault();
    if (!newName || !newPrice || !newCredits || !newFeatures) {
      showToast('All new plan details fields are required.', 'warning');
      return;
    }

    adminCreatePlan(newName, newCredits, newPrice, newFeatures);
    
    // Reset form
    setNewName('');
    setNewPrice('');
    setNewCredits('');
    setNewFeatures('');
    setShowCreate(false);
    showToast('Custom subscription tier created successfully!', 'success');
  };

  const handleDeletePlan = (planId, planName) => {
    if (planName === 'Free' || planName === 'Pro' || planName === 'Enterprise') {
      showToast('Core system tiers cannot be deleted.', 'error');
      return;
    }

    if (confirm(`Are you sure you want to permanently delete the custom "${planName}" plan?`)) {
      adminDeletePlan(planId);
      showToast(`Subscription plan "${planName}" was successfully removed.`, 'info');
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
            <Tags className="w-5 h-5 text-purple-400" />
            SaaS Subscription Plans & Pricing Manager
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Modify platform credit structures, toggle pricing models, configure recurring features, and add custom business tiers.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center justify-center gap-1.5 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer self-start sm:self-center"
        >
          {showCreate ? (
            <>
              <X className="w-4 h-4" /> Cancel Creation
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Create Custom Plan
            </>
          )}
        </button>
      </div>

      {/* Grid containing plans & creations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Plan Creator panel (Slide down/Side panel) */}
        {showCreate && (
          <form onSubmit={handleCreatePlan} className="lg:col-span-12 glass-panel border-purple-500/20 bg-purple-950/5 rounded-2xl p-6 shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 pb-2 border-b border-purple-500/10 select-none">
              <ListPlus className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-gray-200">Configure New Subscription Plan</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Growth Startup"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">Monthly Price ($)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs text-gray-500 select-none"><DollarSign className="w-3.5 h-3.5" /></span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 79"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 pl-9 pr-3.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Credits */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">Credits Included</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs text-gray-500 select-none"><Database className="w-3.5 h-3.5" /></span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2500"
                    value={newCredits}
                    onChange={(e) => setNewCredits(e.target.value)}
                    className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 pl-9 pr-3.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Features list */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Features List (Comma-separated)</label>
              <textarea
                required
                rows={2}
                placeholder="2,500 credits, Dedicated Account Manager, Saved Projects, Unlimited UGC Templates"
                value={newFeatures}
                onChange={(e) => setNewFeatures(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/10 focus:border-purple-500/40 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none"
              />
              <p className="text-[10px] text-gray-500">Provide plan marketing bullet points separated by commas.</p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Add Subscription Tier
            </button>
          </form>
        )}

        {/* Dynamic Cards list */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isEditing = editingId === plan.id;
            const isCore = plan.plan_name === 'Free' || plan.plan_name === 'Pro' || plan.plan_name === 'Enterprise';

            return (
              <div 
                key={plan.id}
                className={`glass-panel rounded-3xl border-purple-500/15 p-6 shadow-xl flex flex-col justify-between relative transition-all duration-300 ${
                  plan.plan_name === 'Pro' 
                    ? 'border-purple-500/35 bg-gradient-to-b from-[#160d26]/40 via-[#10061e]/40 to-[#080311]/40 shadow-[0_0_25px_rgba(168,85,247,0.1)]' 
                    : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.plan_name === 'Pro' && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 border border-purple-400 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] select-none">
                    Most Popular
                  </span>
                )}

                {/* Plan Header */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start select-none">
                    <div>
                      <h3 className="text-base font-extrabold text-white tracking-wide">{plan.plan_name}</h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">Recurring Tier</p>
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(plan)}
                          title="Edit pricing details"
                          className="p-1.5 hover:bg-white/5 border border-purple-500/15 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {!isCore && (
                          <button
                            onClick={() => handleDeletePlan(plan.id, plan.plan_name)}
                            title="Delete plan"
                            className="p-1.5 hover:bg-rose-950/20 border border-rose-500/15 rounded-lg text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pricing / Limits */}
                  <div className="pb-4 border-b border-purple-500/10">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Monthly Cost ($)</label>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-full bg-[#120a1f] border border-purple-500/20 focus:border-purple-500/50 rounded-lg py-1 px-2.5 text-xs text-white focus:outline-none font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Credits Limits</label>
                          <input
                            type="number"
                            value={editCredits}
                            onChange={(e) => setEditCredits(e.target.value)}
                            className="w-full bg-[#120a1f] border border-purple-500/20 focus:border-purple-500/50 rounded-lg py-1 px-2.5 text-xs text-white focus:outline-none font-bold"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1 select-none">
                        <span className="text-2xl font-black text-white">${plan.price}</span>
                        <span className="text-xs text-gray-500">/ month</span>
                      </div>
                    )}
                  </div>

                  {/* Credits amount text */}
                  {!isEditing && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-300 font-extrabold select-none py-1.5 px-3 bg-purple-950/30 border border-purple-500/10 rounded-xl">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      {plan.plan_name === 'Enterprise' ? 'Unlimited Generations' : `${plan.credits.toLocaleString()} standard credits`}
                    </div>
                  )}

                  {/* Plan Features */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[10px] font-black uppercase text-purple-400/50 tracking-widest select-none">Features Included</div>
                    {isEditing ? (
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Features (Comma-separated)</label>
                        <textarea
                          rows={3}
                          value={editFeatures}
                          onChange={(e) => setEditFeatures(e.target.value)}
                          className="w-full bg-[#120a1f] border border-purple-500/20 focus:border-purple-500/50 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    ) : (
                      <ul className="space-y-1.5 text-left">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="text-xs text-gray-400 font-medium flex items-start gap-2 select-none">
                            <span className="p-0.5 bg-purple-950 text-purple-400 rounded mt-0.5"><Check className="w-2.5 h-2.5" /></span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Edit Action Save / Close */}
                {isEditing && (
                  <div className="flex items-center gap-2 mt-6">
                    <button
                      onClick={() => handleSavePlan(plan.id)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="py-2 px-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

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

export default PlansPricing;
