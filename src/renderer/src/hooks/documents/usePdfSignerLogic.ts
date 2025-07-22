import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPdfDocumentUrl } from "../../utils/api";

export function usePdfSignerLogic() {
  useAuth();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState<{ page: number; x: number; y: number } | null>(null);

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
    return await getPdfDocumentUrl(documentId);
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
  };
}