"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

export interface BulkEnquiryOptions {
  category?: string;
  notes?: string;
}

interface BulkEnquiryContextType {
  isOpen: boolean;
  initialOptions?: BulkEnquiryOptions;
  openBulkModal: (options?: BulkEnquiryOptions | React.MouseEvent | any) => void;
  closeBulkModal: () => void;
}

const BulkEnquiryContext = createContext<BulkEnquiryContextType>({
  isOpen: false,
  openBulkModal: () => {},
  closeBulkModal: () => {},
});

export function BulkEnquiryProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [initialOptions, setInitialOptions] = useState<BulkEnquiryOptions | undefined>(undefined);

  const openBulkModal = (options?: BulkEnquiryOptions | React.MouseEvent | any) => {
    let target = "/inquiryform";
    if (options && !options.nativeEvent && !options._reactName && typeof options.preventDefault !== "function") {
      const params = new URLSearchParams();
      if (options.category) params.set("category", options.category);
      if (options.notes) params.set("notes", options.notes);
      const q = params.toString();
      if (q) target += `?${q}`;
    }
    router.push(target);
  };
  const closeBulkModal = () => {
    setIsOpen(false);
    setInitialOptions(undefined);
  };

  // URL query param & hash listener for auto-triggering bulk enquiry form
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const checkUrl = () => {
      try {
        const search = new URLSearchParams(window.location.search);
        const hash = window.location.hash;

        const isBulk =
          search.get("inquiry") === "bulk" ||
          search.get("enquiry") === "bulk" ||
          search.get("bulk") === "true" ||
          search.get("form") === "bulk" ||
          hash === "#bulk-inquiry" ||
          hash === "#bulk-enquiry" ||
          hash === "#bulk-modal" ||
          hash === "#bulk";

        const catParam = (search.get("category") || search.get("cat") || search.get("inquiry") || search.get("enquiry") || "").toLowerCase();
        const isHomeCare = catParam === "homecare" || catParam === "home" || hash === "#homecare" || hash === "#home-care";
        const isCorporate = catParam === "corporate" || catParam === "facility" || catParam === "corporatecare" || hash === "#corporate" || hash === "#corporate-care";

        if (isBulk || isHomeCare || isCorporate) {
          let cat = "";
          let notes = "";
          if (isHomeCare) {
            cat = "Home Care";
            notes = "Requirement for Home Care & Domestic cleaning solutions";
          } else if (isCorporate) {
            cat = "Corporate & Facility Care";
            notes = "Requirement for Corporate & Facility Care / Commercial Fleet solutions";
          }
          openBulkModal(cat ? { category: cat, notes } : undefined);
        }
      } catch (e) {
        console.error("[BulkEnquiryProvider] checkUrl error:", e);
      }
    };

    checkUrl();
    window.addEventListener("hashchange", checkUrl);
    return () => window.removeEventListener("hashchange", checkUrl);
  }, []);

  return (
    <BulkEnquiryContext.Provider value={{ isOpen: false, initialOptions, openBulkModal, closeBulkModal }}>
      {children}
    </BulkEnquiryContext.Provider>
  );
}

export function useBulkEnquiry() {
  return useContext(BulkEnquiryContext);
}
