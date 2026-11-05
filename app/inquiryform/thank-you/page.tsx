"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  ShieldCheck,
  Truck,
  PhoneCall,
  ArrowLeft,
} from "lucide-react";

interface StoredInquiry {
  fullName?: string;
  phone?: string;
  companyName?: string;
  email?: string;
  quantity?: string;
  purchaseTimeline?: string;
  customerType?: string;
  otherDescription?: string;
}

function ThankYouContent() {
  const searchParams = useSearchParams();

  const [inquiry, setInquiry] = useState<StoredInquiry>({
    fullName: searchParams.get("name") || "",
    phone: searchParams.get("phone") || "",
    companyName: searchParams.get("company") || "",
    email: searchParams.get("email") || "",
    quantity: searchParams.get("quantity") || "5 - 10",
    purchaseTimeline: searchParams.get("timeline") || "",
    customerType: searchParams.get("customerType") || searchParams.get("type") || "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("inquiry_data");
        if (raw) {
          const parsed = JSON.parse(raw);
          setInquiry((prev) => ({
            fullName: prev.fullName || parsed.fullName || "",
            phone: prev.phone || parsed.phone || "",
            companyName: prev.companyName || parsed.companyName || "",
            email: prev.email || parsed.email || "",
            quantity: prev.quantity || parsed.quantity || "5 - 10",
            purchaseTimeline: prev.purchaseTimeline || parsed.purchaseTimeline || "",
            customerType:
              prev.customerType ||
              (parsed.customerType === "Other" && parsed.otherDescription
                ? parsed.otherDescription
                : parsed.customerType) ||
              "",
          }));
        }
      } catch (e) {
        console.error("Error reading stored inquiry:", e);
      }
    }
  }, []);

  const displayName = inquiry.fullName || "Valued Partner";
  const displayPhone = inquiry.phone ? inquiry.phone.replace(/\D/g, "") : "";

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-[#005DA6] selection:text-white">
      {/* Brand Top Header Bar */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 group transition-transform active:scale-95"
          >
            <div className="relative w-[135px] h-[28px] sm:w-[170px] sm:h-[34px]">
              <Image
                src="/aquaforceforgigworkers/images/promec-logo.svg"
                alt="PROMEC"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-all font-open-sans"
            >
              <ArrowLeft size={14} />
              <span>Back to Website</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 flex items-center justify-center">
        <div className="max-w-[580px] w-full mx-auto">
          {/* Card Container */}
          <div className="bg-white rounded-[24px] sm:rounded-[28px] p-6 xs:p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] text-slate-900 border border-slate-100 animate-in zoom-in-95 fade-in duration-200">
            {/* Confirmation View */}
            <div className="relative flex flex-col items-center text-center py-2 sm:py-4">
              {/* Checkmark Icon */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#e6fbf2] flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#00c06d] flex items-center justify-center shadow-xs">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[3.5]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>

              <h1 className="text-xl xs:text-2xl sm:text-[28px] font-bold font-montserrat text-[#0F1729] tracking-tight leading-snug">
                Inquiry Submitted Successfully!
              </h1>

              <p className="text-[#475569] font-open-sans text-xs xs:text-[13.5px] sm:text-[14px] max-w-[440px] mx-auto mt-2 sm:mt-2.5 leading-relaxed font-normal">
                Thank you,{" "}
                <strong className="text-[#0f172a] font-bold font-open-sans">
                  {displayName}
                </strong>
                . Our enterprise sales team for{" "}
                <strong className="text-[#005DA6] font-bold font-open-sans">
                  AquaForce® 1400
                </strong>{" "}
                has received your inquiry. An automated confirmation message has been sent to your WhatsApp at{" "}
                <strong className="text-[#0f172a] font-bold font-open-sans">
                  +91 {displayPhone || "registered number"}
                </strong>
                .
              </p>

              {/* Summary Details Card */}
              <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] p-4 sm:p-5 mt-5 sm:mt-6 text-left font-open-sans space-y-3 divide-y divide-[#e2e8f0]/80 shadow-2xs">
                {inquiry.companyName && (
                  <div className="flex items-center justify-between text-[13px] pt-0 font-open-sans">
                    <span className="text-[#64748b] font-medium font-open-sans">
                      Company / Business
                    </span>
                    <span className="text-[#0f172a] font-bold font-open-sans truncate max-w-[220px]">
                      {inquiry.companyName}
                    </span>
                  </div>
                )}

                <div
                  className={`flex items-center justify-between text-[13px] ${
                    inquiry.companyName ? "pt-3" : "pt-0"
                  } font-open-sans`}
                >
                  <span className="text-[#64748b] font-medium font-open-sans">
                    Required Quantity
                  </span>
                  <span className="bg-[#f0f9ff] border border-[#005DA6]/35 text-[#005DA6] text-xs font-bold font-open-sans px-3 py-0.5 rounded-full leading-none">
                    {inquiry.quantity ? `${inquiry.quantity} Units` : "5 - 10 Units"}
                  </span>
                </div>

                {displayPhone && (
                  <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
                    <span className="text-[#64748b] font-medium font-open-sans">
                      Contact Number
                    </span>
                    <span className="text-[#0f172a] font-bold font-open-sans tracking-wide">
                      +91 {displayPhone}
                    </span>
                  </div>
                )}

                {inquiry.email && (
                  <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
                    <span className="text-[#64748b] font-medium font-open-sans">
                      Email
                    </span>
                    <span className="text-[#0f172a] font-bold font-open-sans truncate max-w-[220px]">
                      {inquiry.email}
                    </span>
                  </div>
                )}

                {inquiry.purchaseTimeline && (
                  <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
                    <span className="text-[#64748b] font-medium font-open-sans">
                      Timeline
                    </span>
                    <span className="text-[#0f172a] font-bold font-open-sans">
                      {inquiry.purchaseTimeline}
                    </span>
                  </div>
                )}

                {inquiry.customerType && (
                  <div className="flex items-center justify-between text-[13px] pt-3 font-open-sans">
                    <span className="text-[#64748b] font-medium font-open-sans">
                      Customer Type
                    </span>
                    <span className="text-[#0f172a] font-bold font-open-sans truncate max-w-[220px]">
                      {inquiry.customerType}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col sm:flex-row gap-3 mt-5 sm:mt-6">
                <Link
                  href="/"
                  className="flex-1 bg-[#005DA6] hover:bg-[#004e8c] active:bg-[#004277] text-white font-open-sans font-bold text-xs xs:text-sm uppercase tracking-wider py-3.5 sm:py-4 rounded-[12px] shadow-[0_4px_14px_rgba(0,93,166,0.25)] transition-all active:scale-[0.99] text-center"
                >
                  RETURN TO HOMEPAGE
                </Link>
                <a
                  href="https://wa.me/917387588963"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-open-sans font-bold text-xs xs:text-sm py-3.5 sm:py-4 px-5 rounded-[12px] shadow-2xs transition-all active:scale-[0.99]"
                >
                  <MessageSquare size={16} className="text-[#00c06d]" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-[11px] font-bold text-white font-montserrat">
                1-Year Warranty
              </span>
              <span className="text-[10px] text-slate-400 font-open-sans">
                Commercial grade
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-5 h-5 text-sky-400 mb-1" />
              <span className="text-[11px] font-bold text-white font-montserrat">
                Pan-India Delivery
              </span>
              <span className="text-[10px] text-slate-400 font-open-sans">
                Doorstep dispatch
              </span>
            </div>
            <div className="flex flex-col items-center">
              <PhoneCall className="w-5 h-5 text-purple-400 mb-1" />
              <span className="text-[11px] font-bold text-white font-montserrat">
                Priority Support
              </span>
              <span className="text-[10px] text-slate-400 font-open-sans">
                Dedicated manager
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/60 py-6 text-center text-xs text-slate-500 font-open-sans">
        <div className="max-w-[1240px] mx-auto px-4">
          <p>
            © {new Date().getFullYear()} PROMEC INDIA. All rights reserved. AMEC
            Mobility Private Limited.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-white font-open-sans">
          Loading confirmation...
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
