"use client";

import { useState } from "react";
import { X, AlertCircle, AlertTriangle, CheckCircle2, Truck, Package, ShieldAlert, ArrowRight } from "lucide-react";
import { PromecOrder } from "@/lib/orderStore";

interface CancelOrderModalProps {
  order: PromecOrder | null;
  isOpen: boolean;
  customerPhone: string;
  onClose: () => void;
  onOrderCancelled: (updatedOrder: PromecOrder) => void;
}

const CANCELLATION_REASONS = [
  { id: "MISTAKE", label: "Placed order by mistake / accidental duplicate" },
  { id: "DELAY", label: "Delivery taking longer than expected / changed mind" },
  { id: "ADDRESS_CHANGE", label: "Need to change delivery address or contact number" },
  { id: "FOUND_ALTERNATIVE", label: "Purchased another washer / alternative equipment" },
  { id: "FINANCIAL", label: "Financial / personal reasons" },
  { id: "OTHER", label: "Other reason" },
];

export default function CancelOrderModal({
  order,
  isOpen,
  customerPhone,
  onClose,
  onOrderCancelled,
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0].label);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const isShipped = order.orderStatus === "shipped" || Boolean(order.fulfillment?.waybill);
  const waybill = order.fulfillment?.waybill || "";
  const isCod = order.payment.method === "COD_ADVANCE";
  const amountPaidInINR = Math.round(order.payment.amountPaidInPaise / 100);

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/aquaforceforgigworkers/api/account/orders/${encodeURIComponent(order.id)}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: customerPhone,
          reason: selectedReason,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to cancel order");
      }

      setSuccessMessage(data.message || "Order cancelled successfully.");
      if (data.order) {
        onOrderCancelled(data.order);
      }
    } catch (err: any) {
      setError(err.message || "Failed to cancel order. Please try again or contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSuccessMessage(null);
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 font-open-sans">
      <div className="relative w-full max-w-[560px] max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 font-open-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-montserrat text-[#0F1729]">
                Cancel Order
              </h3>
              <p className="text-xs text-slate-500 font-open-sans">
                Order ID: <span className="font-bold text-slate-900 font-montserrat">{order.id}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {successMessage ? (
            /* Success Screen */
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span className="text-xs font-bold font-montserrat uppercase tracking-wider text-emerald-600">
                  Cancellation Confirmed
                </span>
                <h4 className="text-lg sm:text-xl font-bold font-montserrat text-[#0F1729] mt-1">
                  Order {order.id} is Cancelled
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                  {successMessage}
                </p>
              </div>

              {isShipped && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs space-y-1.5 text-amber-950">
                  <div className="flex items-center gap-1.5 font-bold font-montserrat text-amber-900">
                    <Truck size={14} className="text-amber-700" />
                    <span>Delhivery Doorstep Notice:</span>
                  </div>
                  <p className="leading-relaxed font-open-sans text-[11.5px] text-amber-900">
                    If the Delhivery rider attempts delivery before the Return to Origin sync completes, please inform them: <em>&ldquo;I have cancelled this order with the merchant, please mark it as Customer Refused.&rdquo;</em>
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 bg-[#0066cc] hover:bg-[#0052b3] text-white font-bold font-montserrat uppercase tracking-wider text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Back to Orders
                </button>
              </div>
            </div>
          ) : (
            /* Cancellation Form */
            <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs font-open-sans">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-open-sans">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Order Item & Status Strip */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0066cc] flex items-center justify-center shrink-0">
                    <Package size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 font-montserrat truncate text-xs">
                      {order.items?.[0]?.productName || "Aquaforce® 1400 PSI Tech"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-open-sans truncate">
                      Color: {order.items?.[0]?.color || "Yellow"} • Total: ₹{order.pricing.finalTotalInINR?.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-montserrat border ${
                    isShipped
                      ? "bg-sky-50 border-sky-200 text-[#0066cc]"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}>
                    {isShipped ? "In Transit" : "Confirmed"}
                  </span>
                  {amountPaidInINR > 0 && (
                    <span className="block text-[10px] text-slate-500 font-montserrat mt-0.5">
                      Paid: ₹{amountPaidInINR.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              {/* In-Transit Special Notice Banner */}
              {isShipped ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-xl space-y-2 text-amber-950">
                  <div className="flex items-center gap-1.5 font-bold font-montserrat text-xs text-amber-900">
                    <AlertTriangle size={15} className="text-amber-700 shrink-0" />
                    <span>Your device is currently in transit with Delhivery Express</span>
                  </div>
                  <p className="text-[11.5px] text-amber-900 leading-relaxed font-open-sans">
                    AWB Tracking: <strong>{waybill}</strong>. Submitting this cancellation will immediately issue an <strong>RTO (Return to Origin)</strong> instruction to Delhivery to halt forward delivery and return the machine to our warehouse.
                  </p>
                  <p className="text-[11px] text-amber-800 font-medium">
                    💡 If a courier executive calls or attempts delivery, simply tell them you have cancelled and refuse delivery.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-[11.5px] text-blue-900 leading-relaxed">
                  Your order is prepared at our warehouse and has not been dispatched yet. Cancellation is processed immediately.
                </div>
              )}

              {/* Reason Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-montserrat">
                  Reason for Cancellation *
                </label>
                <div className="space-y-1.5">
                  {CANCELLATION_REASONS.map((r) => (
                    <label
                      key={r.id}
                      onClick={() => setSelectedReason(r.label)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedReason === r.label
                          ? "bg-blue-50/70 border-[#0066cc] text-slate-900 font-medium shadow-2xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        checked={selectedReason === r.label}
                        onChange={() => setSelectedReason(r.label)}
                        className="accent-[#0066cc]"
                      />
                      <span className="text-xs font-open-sans">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Comments */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 font-montserrat">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us if there's anything we can do to resolve this instead..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0066cc] rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-open-sans"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-montserrat text-xs transition-colors cursor-pointer"
                >
                  Keep My Order
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold font-montserrat text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <span>Cancelling...</span>
                  ) : (
                    <span>Confirm Order Cancellation</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
