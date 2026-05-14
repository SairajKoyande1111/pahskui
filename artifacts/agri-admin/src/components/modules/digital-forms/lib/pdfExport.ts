import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function downloadAsPdf(element: HTMLElement, filename: string): Promise<void> {
  const noPrintEls = document.querySelectorAll<HTMLElement>(".df-no-print");
  noPrintEls.forEach((el) => (el.style.display = "none"));
  try {
    const canvas = await html2canvas(element, {
      scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false,
      windowWidth: element.scrollWidth, windowHeight: element.scrollHeight,
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pageW = 297, pageH = 210, margin = 6;
    const usableW = pageW - margin * 2, usableH = pageH - margin * 2;
    const scale = Math.min(usableW / canvas.width, usableH / canvas.height);
    const pdfImgW = canvas.width * scale, pdfImgH = canvas.height * scale;
    const x = margin + (usableW - pdfImgW) / 2, y = margin + (usableH - pdfImgH) / 2;
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    pdf.addImage(imgData, "JPEG", x, y, pdfImgW, pdfImgH);
    pdf.save(filename);
  } finally {
    noPrintEls.forEach((el) => (el.style.display = ""));
  }
}
