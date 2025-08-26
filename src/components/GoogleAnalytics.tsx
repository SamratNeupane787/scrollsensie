"use client";

import { useEffect } from "react";
import { initGA } from "@/lib/analytics";

export function GoogleAnalytics() {
  useEffect(() => {
    // Initialize Google Analytics when component mounts
    initGA();
  }, []);

  // Don't render anything - this is just for initialization
  return null;
}
