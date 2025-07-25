import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchPdfUrl as fetchPdfUrlExternal } from "./pdf/signer/pdfSignerLogic";

export function usePdfSignerLogic() {
  useAuth();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState<{ page: number; x: number; y: number; canvasX: number; canvasY: number } | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const handlePdfClick = (pdfX: number, pdfY: number, page: number, canvasX: number, canvasY: number) => {
    setSignaturePosition({ page, x: pdfX, y: pdfY, canvasX, canvasY });
  };

  const pdfUrl = pdfFile ? URL.createObjectURL(pdfFile) : null;

  const fetchPdfUrl = async (documentId: string) => {
    return await fetchPdfUrlExternal(documentId, setTotalPages);
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