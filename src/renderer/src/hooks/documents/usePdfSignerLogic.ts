import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchPdfUrl as fetchPdfUrlExternal, handlePdfClick as handlePdfClickExternal } from "./pdf/signer/pdfSignerLogic";

export function usePdfSignerLogic() {
  useAuth();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState<{ page: number; x: number; y: number } | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const handlePdfClick = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    handlePdfClickExternal(event, selectedPage, setSignaturePosition);
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