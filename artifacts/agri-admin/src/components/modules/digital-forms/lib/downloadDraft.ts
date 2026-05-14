import { createRoot } from "react-dom/client";
import { createElement } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Draft, Form7Data, Form12DraftData } from "./drafts";
import Form7PdfCard from "../components/Form7PdfCard";
import Form12PdfCard from "../components/Form12PdfCard";

const MINIMAL_PDF_CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body, div, span, table, td, th, tr, p, h1, h2, h3 { font-family: sans-serif; }
.w-full { width: 100%; } .w-1\\/2 { width: 50%; } .w-1\\/3 { width: 33.333%; } .w-1\\/4 { width: 25%; }
.w-\\[25\\%\\] { width: 25%; } .w-\\[21\\%\\] { width: 21%; } .w-\\[15\\%\\] { width: 15%; }
.w-\\[10\\%\\] { width: 10%; } .w-\\[7\\%\\] { width: 7%; } .w-\\[5\\%\\] { width: 5%; }
.w-\\[4\\%\\] { width: 4%; } .w-\\[6\\%\\] { width: 6%; } .w-\\[8\\%\\] { width: 8%; }
.w-\\[12\\%\\] { width: 12%; } .w-\\[55\\%\\] { width: 55%; } .w-\\[20\\%\\] { width: 20%; }
.flex { display: flex; } .flex-1 { flex: 1; } .h-full { height: 100%; }
.min-h-\\[1em\\] { min-height: 1em; } .min-h-\\[1\\.2em\\] { min-height: 1.2em; }
.min-h-\\[1\\.4em\\] { min-height: 1.4em; } .min-h-\\[60px\\] { min-height: 60px; }
.h-8 { height: 2rem; } .h-10 { height: 2.5rem; }
.p-0 { padding: 0; } .p-1 { padding: 0.25rem; } .p-2 { padding: 0.5rem; }
.p-4 { padding: 1rem; } .p-8 { padding: 2rem; }
.px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.mb-1 { margin-bottom: 0.25rem; } .mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; } .mb-6 { margin-bottom: 1.5rem; }
.mt-1 { margin-top: 0.25rem; } .mt-4 { margin-top: 1rem; }
.space-y-1 > * + * { margin-top: 0.25rem; }
.text-center { text-align: center; } .text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-lg { font-size: 1.125rem; } .text-xl { font-size: 1.25rem; }
.text-\\[10px\\] { font-size: 10px; }
.font-normal { font-weight: 400; } .font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
.italic { font-style: italic; } .whitespace-pre-wrap { white-space: pre-wrap; }
.break-words { overflow-wrap: break-word; }
.block { display: block; } .inline-block { display: inline-block; }
.bg-white { background-color: #ffffff; } .bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; } .bg-gray-200 { background-color: #e5e7eb; }
.text-gray-700 { color: #374151; } .text-gray-900 { color: #111827; }
.border { border-width: 1px; border-style: solid; border-color: #e5e7eb; }
.border-black { border-color: #000; } .border-gray-300 { border-color: #d1d5db; }
.border-collapse { border-collapse: collapse; }
.border-b { border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: #000; }
.border-r { border-right-width: 1px; border-right-style: solid; border-right-color: #000; }
.border-t { border-top-width: 1px; border-top-style: solid; border-top-color: #000; }
.rounded-sm { border-radius: 0.125rem; }
.align-top { vertical-align: top; } .align-middle { vertical-align: middle; }
table { border-collapse: collapse; }
`;

function cloneWithoutOklch(_originalDoc: Document, clonedDoc: Document) {
  clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((el) => el.remove());
  clonedDoc.querySelectorAll("style").forEach((el) => { if (el.textContent?.includes("oklch")) el.remove(); });
  const style = clonedDoc.createElement("style");
  style.textContent = MINIMAL_PDF_CSS;
  clonedDoc.head.appendChild(style);
}

async function captureAsPdf(container: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(container, {
    scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false, windowWidth: 1100,
    onclone: (_clonedDoc, element) => { cloneWithoutOklch(document, element.ownerDocument); },
  });
  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pageW = 297, pageH = 210, margin = 6;
  const usableW = pageW - margin * 2, usableH = pageH - margin * 2;
  const scale = Math.min(usableW / canvas.width, usableH / canvas.height);
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  pdf.addImage(imgData, "JPEG", margin + (usableW - canvas.width * scale) / 2, margin + (usableH - canvas.height * scale) / 2, canvas.width * scale, canvas.height * scale);
  pdf.save(filename);
}

export async function downloadDraftAsPdf(draft: Draft): Promise<void> {
  const filename = draft.name.replace(/[^\w\u0900-\u097F _-]/g, "_") + ".pdf";
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;top:0;left:-9999px;width:1100px;background:#fff;z-index:-1;";
  document.body.appendChild(container);
  const root = createRoot(container);
  try {
    await new Promise<void>((resolve) => {
      root.render(draft.formType === "form7"
        ? createElement(Form7PdfCard, { data: draft.data as Form7Data })
        : createElement(Form12PdfCard, { data: draft.data as Form12DraftData }));
      setTimeout(resolve, 800);
    });
    await captureAsPdf(container, filename);
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}

export async function downloadAllDraftsAsPdf(drafts: Draft[], onProgress?: (c: number, t: number) => void): Promise<void> {
  for (let i = 0; i < drafts.length; i++) {
    onProgress?.(i + 1, drafts.length);
    await downloadDraftAsPdf(drafts[i]);
    await new Promise((r) => setTimeout(r, 300));
  }
}
