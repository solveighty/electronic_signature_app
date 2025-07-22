import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { getPdfDocumentUrl } from "../../../../utils/api";

export const fetchPdfUrl = async (
  documentId: string,
  setTotalPages: (pages: number) => void
) => {
  const url = await getPdfDocumentUrl(documentId);
  if (url) {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    setTotalPages(pdf.numPages);
  }
  return url;
};

export const handlePdfClick = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  selectedPage: number,
  setSignaturePosition: (pos: { page: number; x: number; y: number }) => void
) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  setSignaturePosition({ page: selectedPage, x, y });
  console.log(
    `Coordenadas de firma: página=${selectedPage}, x=${x.toFixed(2)}%, y=${y.toFixed(2)}%`
  );
};