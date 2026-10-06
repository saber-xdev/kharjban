import { useRef, useState } from "react";
import type { Category, Expense } from "../types";
import { generatePDFFromElement } from "../lib/pdfGenerator";

export function usePDFExport() {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  async function exportPDF(
    expenses: Expense[],
    _categories: Category[],
    filename: string
  ) {
    if (!pdfRef.current) {
      return;
    }
    setGenerating(true);
    try {
      // کمی صبر تا فونت و تصاویر لود شوند
      await new Promise((r) => setTimeout(r, 400));
      await generatePDFFromElement(pdfRef.current, filename);
    } finally {
      setGenerating(false);
    }
  }

  return { pdfRef, generating, exportPDF };
}
