import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDb } from '../services/mockDb';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

const DatabaseContext = createContext();

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider = ({ children }) => {
  const { refreshSessionUser, sessionMode, user } = useAuth();
  
  // Reactive states reflecting database tables
  const [users, setUsers] = useState([]);
  const [generations, setGenerations] = useState([]);
  const [apiSettings, setApiSettings] = useState([]);
  const [plans, setPlans] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Load all tables based on mode
  const refreshAllData = async () => {
    if (sessionMode === 'supabase' && supabase) {
      try {
        // Fetch plans (publicly accessible by everyone)
        let { data: plansData } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price', { ascending: true });
        
        // Self-healing check for plans (Admin only can seed if empty)
        if ((!plansData || plansData.length === 0) && user && user.role === 'admin') {
          console.log("Admin detected empty subscription_plans. Seeding default tiers...");
          const { data: seededPlans, error: seedErr } = await supabase
            .from('subscription_plans')
            .insert([
              { plan_name: 'Free', credits: 50, price: 0.00, features: ['50 welcome credits', 'Access all AI tool editors', 'Local storage backup logs'] },
              { plan_name: 'Pro', credits: 1000, price: 49.00, features: ['1,000 monthly credits', 'Saved Projects project folders', 'Priority service SLA queue', 'Stripe checkout simulator access'] },
              { plan_name: 'Enterprise', credits: 99999, price: 199.00, features: ['Unlimited credits supply', 'Live API keys toggling switcher', 'Dedicated account support 24/7', 'Custom tools cost override nodes'] }
            ])
            .select()
            .order('price', { ascending: true });
          
          if (!seedErr && seededPlans) {
            plansData = seededPlans;
          }
        }
        if (plansData) setPlans(plansData);

        if (!user) return;

        // Fetch user profiles (admin fetches all, normal user fetches own)
        if (user.role === 'admin') {
          const { data: usersData } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
          if (usersData) setUsers(usersData);
        } else {
          const { data: usersData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id);
          if (usersData) setUsers(usersData || []);
        }

        // Fetch generations (RLS automatically restricts regular users to their own)
        const { data: gensData } = await supabase
          .from('generations')
          .select('*')
          .order('created_at', { ascending: false });
        if (gensData) setGenerations(gensData);

        // Fetch transactions (RLS handles access)
        const { data: transData } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });
        if (transData) setTransactions(transData);

        // Fetch API settings (admin only, RLS restricts regular users)
        if (user.role === 'admin') {
          let { data: apiData } = await supabase
            .from('api_settings')
            .select('*')
            .order('provider_name', { ascending: true });
          
          // Self-healing: Seed api_settings if empty
          if (apiData && apiData.length === 0) {
            console.log("Admin detected empty api_settings. Seeding default configurations...");
            const { data: seededData, error: seedErr } = await supabase
              .from('api_settings')
              .insert([
                { provider_name: 'openai', api_key: 'sk-proj-••••••••••••••••••••••••', status: true, is_default: true },
                { provider_name: 'gemini', api_key: 'AIzaSy••••••••••••••••••••••••', status: false, is_default: false }
              ])
              .select()
              .order('provider_name', { ascending: true });
            
            if (!seedErr && seededData) {
              apiData = seededData;
            }
          }
          if (apiData) setApiSettings(apiData);
        } else {
          // Regular users can fetch full settings to execute direct browser API calls
          const { data: apiData } = await supabase
            .from('api_settings')
            .select('*');
          if (apiData) setApiSettings(apiData);
        }
      } catch (err) {
        console.error("Supabase data fetch exception: ", err);
      }
    } else {
      // Mock Fallback mode
      setUsers(mockDb.getUsers());
      setGenerations(mockDb.getGenerations());
      setApiSettings(mockDb.getApiSettings());
      setPlans(mockDb.getPlans());
      setTransactions(mockDb.getTransactions());
    }
  };

  // Re-fetch when user session or mode changes
  useEffect(() => {
    refreshAllData();
  }, [sessionMode, user?.id, user?.role]);

  // --- USER DEDUCTION & WALLET MECHANICS ---
  const deductCredits = async (userId, amount = 1) => {
    if (sessionMode === 'supabase' && supabase) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('credits, plan')
          .eq('id', userId)
          .single();

        if (error || !profile) return false;

        // Enterprise plan features unlimited credits
        if (profile.plan === 'Enterprise') {
          return true;
        }

        if (profile.credits < amount) {
          return false; // Insufficient credits
        }

        const newCredits = Math.max(0, profile.credits - amount);
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', userId);

        if (updateErr) return false;

        await refreshAllData();
        await refreshSessionUser();
        return true;
      } catch (err) {
        console.error("Supabase deductCredits exception: ", err);
        return false;
      }
    } else {
      // Mock Fallback
      const u = mockDb.getUserById(userId);
      if (!u) return false;
      
      if (u.credits < amount && u.plan !== 'Enterprise') {
        return false;
      }

      const currentCredits = u.plan === 'Enterprise' ? u.credits : Math.max(0, u.credits - amount);
      mockDb.updateUser(userId, { credits: currentCredits });
      refreshAllData();
      refreshSessionUser();
      return true;
    }
  };

  const addGeneration = async (toolType, inputData, generatedResult, userId) => {
    if (sessionMode === 'supabase' && supabase) {
      try {
        const { data, error } = await supabase
          .from('generations')
          .insert([
            {
              user_id: userId,
              tool_type: toolType,
              input_data: inputData,
              generated_result: generatedResult,
              credits_used: 1,
              is_saved: false,
            }
          ])
          .select()
          .single();

        if (error) throw error;
        await refreshAllData();
        return data;
      } catch (err) {
        console.error("Supabase addGeneration exception: ", err);
        return null;
      }
    } else {
      // Mock Fallback
      const newGen = mockDb.createGeneration({
        user_id: userId,
        tool_type: toolType,
        input_data: inputData,
        generated_result: generatedResult,
        credits_used: 1,
      });
      refreshAllData();
      return newGen;
    }
  };

  const toggleSaveProject = async (id) => {
    if (sessionMode === 'supabase' && supabase) {
      try {
        const gen = generations.find(g => g.id === id);
        if (!gen) return;

        const { error } = await supabase
          .from('generations')
          .update({ is_saved: !gen.is_saved })
          .eq('id', id);

        if (error) throw error;
        await refreshAllData();
      } catch (err) {
        console.error("Supabase toggleSaveProject exception: ", err);
      }
    } else {
      // Mock Fallback
      const gens = mockDb.getGenerations();
      const gen = gens.find(g => g.id === id);
      if (!gen) return;

      mockDb.updateGeneration(id, { is_saved: !gen.is_saved });
      refreshAllData();
    }
  };

  const deleteProject = async (id) => {
    if (sessionMode === 'supabase' && supabase) {
      try {
        const { error } = await supabase
          .from('generations')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await refreshAllData();
      } catch (err) {
        console.error("Supabase deleteProject exception: ", err);
      }
    } else {
      // Mock Fallback
      mockDb.deleteGeneration(id);
      refreshAllData();
    }
  };

  // --- STRIPE SIMULATION CHECKOUTS ---
  const processStripeCheckout = async (userId, planName, price, credits) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating gateway roundtrip delay

    if (sessionMode === 'supabase' && supabase) {
      try {
        // Fetch current profile to credit them
        const { data: profile, error: getErr } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', userId)
          .single();

        if (getErr || !profile) return { success: false, error: 'User profile not found.' };

        const newCredits = (profile.credits || 0) + credits;
        
        // Update profile
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ plan: planName, credits: newCredits })
          .eq('id', userId);

        if (profileErr) throw profileErr;

        // Log transaction audit
        const { error: txErr } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: userId,
              credits_added: credits,
              amount: price,
              payment_status: 'completed',
            }
          ]);

        if (txErr) throw txErr;

        await refreshAllData();
        await refreshSessionUser();
        return { success: true };
      } catch (err) {
        console.error("Supabase processStripeCheckout exception: ", err);
        return { success: false, error: err.message || 'Payment processing error.' };
      }
    } else {
      // Mock Fallback
      const user = mockDb.getUserById(userId);
      if (!user) return { success: false, error: 'User session not found.' };

      const updatedCredits = (user.credits || 0) + credits;
      mockDb.updateUser(userId, {
        plan: planName,
        credits: updatedCredits
      });

      mockDb.createTransaction({
        user_id: userId,
        credits_added: credits,
        amount: price,
        payment_status: 'completed',
      });

      refreshAllData();
      refreshSessionUser();
      return { success: true };
    }
  };

  // --- ADMIN OPERATION ENGINES ---
  const adminSetUserCredits = async (userId, amount) => {
    const creditsNum = parseInt(amount) || 0;
    if (sessionMode === 'supabase' && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ credits: creditsNum })
          .eq('id', userId);

        if (error) throw error;
        await refreshAllData();
        if (userId === user?.id) await refreshSessionUser();
        return true;
      } catch (err) {
        console.error("Supabase adminSetUserCredits exception: ", err);
        return false;
      }
    } else {
      // Mock Fallback
      const updated = mockDb.updateUser(userId, { credits: creditsNum });
      refreshAllData();
      refreshSessionUser();
      return updated;
    }
  };

  const adminAddUserCredits = async (userId, bonusAmount) => {
    const bonusNum = parseInt(bonusAmount) || 0;
    if (sessionMode === 'supabase' && supabase) {
      try {
        const { data: profile, error: getErr } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', userId)
          .single();

        if (getErr || !profile) return null;

        const newCredits = (profile.credits || 0) + bonusNum;
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', userId);

        if (updateErr) throw updateErr;
        await refreshAllData();
        if (userId === user?.id) await refreshSessionUser();
        return { id: userId, credits: newCredits };
      } catch (err) {
        console.error("Supabase adminAddUserCredits exception: ", err);
        return null;
      }
    } else {
      // Mock Fallback
      const u = mockDb.getUserById(userId);
      if (!u) return null;
      
      const newCredits = (u.credits || 0) + bonusNum;
      const updated = mockDb.updateUser(userId, { credits: newCredits });
      refreshAllData();
      refreshSessionUser();
      return updated;
    }
  };

  const adminSetUserBan = async (userId, isBanned) => {
    if (sessionMode === 'supabase' && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ is_banned: isBanned })
          .eq('id', userId);

        if (error) throw error;
        await refreshAllData();
        if (userId === user?.id) await refreshSessionUser();
        return true;
      } catch (err) {
        console.error("Supabase adminSetUserBan exception: ", err);
        return false;
      }
    } else {
      // Mock Fallback
      const updated = mockDb.updateUser(userId, { is_banned: isBanned });
      refreshAllData();
      refreshSessionUser();
      return updated;
    }
  };

  const adminSetUserPlan = async (userId, planName) => {
    const selectedPlan = plans.find(p => p.plan_name === planName);
    const creditsToSet = selectedPlan ? selectedPlan.credits : 50;

    if (sessionMode === 'supabase' && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ plan: planName, credits: creditsToSet })
          .eq('id', userId);

        if (error) throw error;
        await refreshAllData();
        if (userId === user?.id) await refreshSessionUser();
        return true;
      } catch (err) {
        console.error("Supabase adminSetUserPlan exception: ", err);
        return false;
      }
    } else {
      // Mock Fallback
      const updated = mockDb.updateUser(userId, { 
        plan: planName, 
        credits: creditsToSet 
      });
      refreshAllData();
      refreshSessionUser();
      return updated;
    }
  };

  const adminDeleteUser = async (userId) => {
    if (sessionMode === 'supabase' && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (error) throw error;
        await refreshAllData();
        return true;
      } catch (err) {
        console.error("Supabase adminDeleteUser exception: ", err);
        return false;
      }
    } else {
      // Mock Fallback
      mockDb.deleteUser(userId);
      refreshAllData();
      refreshSessionUser();
      return true;
    }
  };

  // --- API MANAGEMENT ENGINES ---
  const adminUpdateApiSetting = async (providerName, key, status) => {
    if (sessionMode === 'supabase' && supabase) {
      try {
        const { error } = await supabase
          .from('api_settings')
          .upsert(
            { provider_name: providerName, api_key: key, status: status },
            { onConflict: 'provider_name' }
          );

        if (error) throw error;
        await refreshAllData();
      } catch (err) {
        console.error("Supabase adminUpdateApiSetting exception: ", err);
      }
    } else {
      // Mock Fallback
      mockDb.updateApiSetting(providerName, {
        api_key: key,
        status: status
      });
      refreshAllData();
    }
  };

  const adminSetDefaultProvider = async (providerName) => {
    if (sessionMode === 'supabase' && supabase) {
      try {
        // Clear is_default from all providers
        await supabase
          .from('api_settings')
          .update({ is_default: false })
          .neq('provider_name', providerName);

        // Set is_default for the selected provider
        const { error } = await supabase
          .from('api_settings')
          .update({ is_default: true })
          .eq('provider_name', providerName);

        if (error) throw error;
        await refreshAllData();
      } catch (err) {
        console.error("Supabase adminSetDefaultProvider exception: ", err);
      }
    } else {
      // Mock Fallback
      mockDb.switchDefaultProvider(providerName);
      refreshAllData();
    }
  };

  // --- PLANS & PRICING ENGINE ---
  const adminUpdatePlanDetails = async (planId, credits, price, features) => {
    const featuresArray = typeof features === 'string' 
      ? features.split(',').map(f => f.trim()) 
      : features;

    if (sessionMode === 'supabase' && supabase) {
      try {
        const { error } = await supabase
          .from('subscription_plans')
          .update({
            credits: parseInt(credits) || 0,
            price: parseFloat(price) || 0.00,
            features: featuresArray
          })
          .eq('id', planId);

        if (error) throw error;
        await refreshAllData();
      } catch (err) {
        console.error("Supabase adminUpdatePlanDetails exception: ", err);
      }
    } else {
      // Mock Fallback
      mockDb.updatePlan(planId, {
        credits: parseInt(credits) || 0,
        price: parseFloat(price) || 0.00,
        features: featuresArray
      });
      refreshAllData();
    }
  };

  const adminCreatePlan = async (name, credits, price, features) => {
    const featuresArray = typeof features === 'string' 
      ? features.split(',').map(f => f.trim()) 
      : features;

    if (sessionMode === 'supabase' && supabase) {
      try {
        const { error } = await supabase
          .from('subscription_plans')
          .insert([
            {
              plan_name: name,
              credits: parseInt(credits) || 0,
              price: parseFloat(price) || 0.00,
              features: featuresArray
            }
          ]);

        if (error) throw error;
        await refreshAllData();
      } catch (err) {
        console.error("Supabase adminCreatePlan exception: ", err);
      }
    } else {
      // Mock Fallback
      mockDb.createPlan({
        plan_name: name,
        credits: parseInt(credits) || 0,
        price: parseFloat(price) || 0.00,
        features: featuresArray
      });
      refreshAllData();
    }
  };

  const adminDeletePlan = async (planId) => {
    if (sessionMode === 'supabase' && supabase) {
      try {
        const { error } = await supabase
          .from('subscription_plans')
          .delete()
          .eq('id', planId);

        if (error) throw error;
        await refreshAllData();
      } catch (err) {
        console.error("Supabase adminDeletePlan exception: ", err);
      }
    } else {
      // Mock Fallback
      mockDb.deletePlan(planId);
      refreshAllData();
    }
  };

  const adminResetUserCredits = async (userId) => {
    if (sessionMode === 'supabase' && supabase) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', userId)
          .single();

        if (error || !profile) return;

        const matchedPlan = plans.find(p => p.plan_name === profile.plan) || { credits: 50 };
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ credits: matchedPlan.credits })
          .eq('id', userId);

        if (updateErr) throw updateErr;
        await refreshAllData();
        if (userId === user?.id) await refreshSessionUser();
      } catch (err) {
        console.error("Supabase adminResetUserCredits exception: ", err);
      }
    } else {
      // Mock Fallback
      const u = mockDb.getUserById(userId);
      if (!u) return;
      
      const matchedPlan = plans.find(p => p.plan_name === u.plan) || { credits: 50 };
      mockDb.updateUser(userId, { credits: matchedPlan.credits });
      refreshAllData();
      refreshSessionUser();
    }
  };

  return (
    <DatabaseContext.Provider value={{
      users,
      generations,
      apiSettings,
      plans,
      transactions,
      deductCredits,
      addGeneration,
      toggleSaveProject,
      deleteProject,
      processStripeCheckout,
      adminSetUserCredits,
      adminAddUserCredits,
      adminSetUserBan,
      adminSetUserPlan,
      adminDeleteUser,
      adminUpdateApiSetting,
      adminSetDefaultProvider,
      adminUpdatePlanDetails,
      adminCreatePlan,
      adminDeletePlan,
      adminResetUserCredits,
      refreshAllData,
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};
