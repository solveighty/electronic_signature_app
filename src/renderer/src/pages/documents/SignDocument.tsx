import { Container } from '@mantine/core';
import { useSignDocumentLogic } from '../../hooks/documents/useSignDocumentLogic';
import { usePdfSignerLogic } from '../../hooks/documents/usePdfSignerLogic';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { useEffect, useState } from 'react';
import SignStepper from '../../components/SignDocument/Stepper/SignStepper';
import SignatureStatusCard from '../../components/SignDocument/Card/SignatureStatusCard';
import SignDocumentHeader from '../../components/SignDocument/Header/SignDocumentHeader';
import SignaturePreviewModal from '../../components/SignDocument/Modals/SignaturePreviewModal';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

const SignDocument = () => {
  const logic = useSignDocumentLogic();
  const pdfSigner = usePdfSignerLogic();

  const [securePdfUrl, setSecurePdfUrl] = useState<string | null>(null);


  useEffect(() => {
    if (logic.selectedDocument) {
      pdfSigner.fetchPdfUrl(String(logic.selectedDocument.id)).then(setSecurePdfUrl);
    } else {
      setSecurePdfUrl(null);
    }
  }, [logic.selectedDocument]);

  // Permitir preselección externa del documento mediante evento global
  useEffect(() => {
    const handler = (e: any) => {
      const id = e?.detail?.id as string | undefined;
      if (id) {
        logic.setSelectedDocumentId(id);
      }
    };
    window.addEventListener('select-document-for-sign', handler);
    return () => window.removeEventListener('select-document-for-sign', handler);
  }, []);

  useEffect(() => {
    if (pdfSigner.signaturePosition) {
      logic.setSignaturePosition({
        page: String(pdfSigner.signaturePosition.page),
        x: String(pdfSigner.signaturePosition.x), // Usar coordenadas PDF reales
        y: String(pdfSigner.signaturePosition.y), // Usar coordenadas PDF reales
      });
    }
  }, [pdfSigner.signaturePosition]);

  return (
    <>
      <Container size="lg" py="md" className='dark:bg-gray-900 dark:text-gray-100'>
        {/* Header con título y botón de actualización */}
        <SignDocumentHeader
          onRefresh={logic.handleRefresh}
          loading={logic.isLoadingDocuments}
        />
        {/* Badges de estado del certificado y los documentos. */}
        <SignatureStatusCard
          hasCertificate={logic.hasCertificate}
          documentOptionsCount={logic.documentOptions.length}
        />
        <SignStepper logic={logic} pdfSigner={pdfSigner} securePdfUrl={securePdfUrl} />
      </Container>
      {/* Modal para previsualizar la firma antes de firmar el documento */}
      <SignaturePreviewModal
        opened={logic.opened}
        onClose={logic.close}
        signaturePosition={logic.signaturePosition}
      />
    </>
  );
};

export default SignDocument;