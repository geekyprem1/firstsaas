import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

export const Billing = () => {
  const { user } = useAuth();
  const { plans, processStripeCheckout, transactions } = useDatabase();

  // Stripe Simulator state
  const [selectedPlan, setSelectedPlan] = useState(null); // plan object to checkout
  const [isStripeOpen, setIsStripeOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  // Card Form Inputs
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardName, setCardName] = useState(user?.name || 'Alex Rivera');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('424');

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleLaunchCheckout = (plan) => {
    if (plan.plan_name === user.plan) {
      showToast('You are already subscribed to this tier!', 'warning');
      return;
    }
    setSelectedPlan(plan);
    setIsStripeOpen(true);
  };

  const handleStripePayment = async (e) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !cardExpiry || !cardCvc) {
      showToast('Please fill in all credit card details.', 'warning');
      return;
    }

    setCheckoutLoading(true);

    try {
      const result = await processStripeCheckout(
        user.id,
        selectedPlan.plan_name,
        selectedPlan.price,
        selectedPlan.credits
      );

      if (result.success) {
        showToast(`Stripe payment completed! Premium ${selectedPlan.plan_name} active.`, 'success');
        setIsStripeOpen(false);
      } else {
        showToast(result.error || 'Payment failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Stripe gateway authentication failed.', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Get only user transactions
  const userTx = transactions.filter(t => t.user_id === user?.id) || [];

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* Description */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl font-black text-white tracking-wide">Premium Plans & Creative Fuel</h2>
        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          Choose the billing plan that fits your business needs. Top-up credits instantly and unlock multi-model switching, priority API speeds, and advanced marketing directors.
        </p>
      </div>

      {/* Subscription cards display grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {plans.map((plan) => {
          const isActive = user?.plan === plan.plan_name;
          const isPro = plan.plan_name === 'Pro';
          
          return (
            <div 
              key={plan.id}
              className={`
                relative overflow-hidden rounded-2xl border p-6 flex flex-col justify-between h-full min-h-[440px] shadow-2xl transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-b from-[#180d2c] to-black border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.18)] translate-y-[-4px]' 
                  : isPro 
                    ? 'bg-gradient-to-b from-[#10091d] to-[#04010a] border-purple-500/30 hover:border-purple-500/50 hover:translate-y-[-2px]'
                    : 'bg-[#090513]/60 border-purple-500/10 hover:border-purple-500/20 hover:translate-y-[-2px]'}
              `}
            >
              {/* Popular Tag for Pro Plan */}
              {isPro && (
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-purple-600 border border-purple-400 text-[9px] font-black text-white uppercase tracking-wider animate-pulse select-none">
                  Most Popular
                </div>
              )}

              {/* Title & price headers */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white">{plan.plan_name}</h3>
                  <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                    {plan.plan_name === 'Enterprise' ? 'Unlimited Generations' : `${plan.credits} credits included`}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 select-none">
                  <span className="text-3xl font-black text-white">${plan.price}</span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>

                {/* Features Divider */}
                <div className="h-[1px] bg-purple-500/10" />

                {/* Features Lists */}
                <ul className="space-y-2.5 text-xs text-gray-400 font-semibold">
                  {plan.features?.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-6">
                <button
                  onClick={() => handleLaunchCheckout(plan)}
                  disabled={isActive}
                  className={`
                    w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer
                    ${isActive 
                      ? 'bg-purple-950/20 border border-purple-500/30 text-purple-400 cursor-not-allowed' 
                      : 'btn-primary text-white'}
                  `}
                >
                  {isActive ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      Active Subscriber
                    </>
                  ) : (
                    <>
                      Select {plan.plan_name} Plan
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe Payment Simulator Modal */}
      {selectedPlan && (
        <Modal
          isOpen={isStripeOpen}
          onClose={() => !checkoutLoading && setIsStripeOpen(false)}
          title="Secure Stripe Checkout Gateway"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleStripePayment} className="space-y-4 text-left">
            {/* Header / Summary */}
            <div className="p-4 bg-purple-950/20 border border-purple-500/10 rounded-xl space-y-2">
              <div className="text-[10px] text-purple-400 font-black uppercase tracking-wider select-none">Order Invoice Summary</div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-extrabold text-white">AdViral AI {selectedPlan.plan_name} Subscription</span>
                <span className="font-black text-purple-300">${selectedPlan.price}.00</span>
              </div>
              <div className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                Charged immediately. Grants {selectedPlan.credits.toLocaleString()} credits to your wallet. Automatic monthly billing.
              </div>
            </div>

            {/* Credit Card inputs */}
            <div className="space-y-3">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                Credit Card Information
              </div>

              {/* Card Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400">Card Number</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-black/40 border border-purple-500/15 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  placeholder="4242 4242 4242 4242"
                />
              </div>

              {/* Card Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400">Name on Card</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-black/40 border border-purple-500/15 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  placeholder="Sarah Jenkins"
                />
              </div>

              {/* Expiry and CVC grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">Expiration Date</label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-black/40 border border-purple-500/15 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs text-white focus:outline-none text-center"
                    placeholder="MM/YY"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">CVC Code</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-black/40 border border-purple-500/15 focus:border-purple-500/40 rounded-xl py-2 px-3 text-xs text-white focus:outline-none text-center"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            {/* Shield disclaimer */}
            <div className="flex items-center gap-2 text-[10px] text-gray-500 leading-normal">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Payments are simulated using Stripe sandbox parameters. Do not enter actual credentials unless preferred for demo styling.</span>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={checkoutLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 btn-primary rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              {checkoutLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Authorizing via Stripe...</span>
                </div>
              ) : (
                <>
                  Pay & Activate Pro (${selectedPlan.price}.00)
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </Modal>
      )}

      {/* 3. Transaction History Log Section */}
      <div className="glass-panel rounded-2xl border-purple-500/15 p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 select-none">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Invoice Billing History
          </h3>
          <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-bold select-none">
            SECURE STRIPE LOGS
          </span>
        </div>

        {userTx.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500 leading-relaxed font-semibold">
            No transaction invoices found. Subscribe to a pricing tier above to record Stripe checkouts.
          </div>
        ) : (
          <div className="overflow-x-auto select-none">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-500/10 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5">Invoice ID</th>
                  <th className="py-2.5">Credits Added</th>
                  <th className="py-2.5">Billing Amount</th>
                  <th className="py-2.5">Stripe Status</th>
                  <th className="py-2.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/5 text-gray-300 font-medium">
                {userTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-purple-950/5 transition-colors">
                    <td className="py-3 font-mono text-[10px] text-purple-300 truncate max-w-[120px]">{tx.id}</td>
                    <td className="py-3 font-bold">+{tx.credits_added?.toLocaleString()}</td>
                    <td className="py-3">${tx.amount?.toFixed(2)}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-black text-[9px] uppercase">
                        {tx.payment_status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-500 text-[10px]">
                      {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
export default Billing;
