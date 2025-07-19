import { useState } from "react";

export function usePdfSignerLogic() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState<{ x: number; y: number } | null>(null);

  const handlePdfClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setSignaturePosition({ x, y });
  };

  return {
    pdfFile,
    setPdfFile,
    selectedPage,
    setSelectedPage,
    signaturePosition,
    setSignaturePosition,
    handlePdfClick,
  };
}