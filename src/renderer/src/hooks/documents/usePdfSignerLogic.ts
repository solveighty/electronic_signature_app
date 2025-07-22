import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPdfDocumentUrl } from "../../utils/api";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

export function usePdfSignerLogic() {
  useAuth();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState<{ page: number; x: number; y: number } | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const handlePdfClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setSignaturePosition({ page: selectedPage, x, y });

    console.log(
      `Coordenadas de firma: página=${selectedPage}, x=${x.toFixed(2)}%, y=${y.toFixed(2)}%`
    );
  };

  const pdfUrl = pdfFile ? URL.createObjectURL(pdfFile) : null;

  const fetchPdfUrl = async (documentId: string) => {
    const url = await getPdfDocumentUrl(documentId);
    if (url) {
      // Obtener el número de páginas usando pdf.js
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);
    }
    return url;
  };

  return {
    pdfFile,
    setPdfFile,
    selectedPage,
    setSelectedPage,
    signaturePosition,
    setSignaturePosition,
    handlePdfClick,
    pdfUrl,
    fetchPdfUrl,
    totalPages,
  };
}