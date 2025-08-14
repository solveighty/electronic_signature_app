import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { PdfPageViewerProps } from "./types/pdfPageViewer";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

interface PdfPageViewerPropsWithClick extends PdfPageViewerProps {
  onClick?: (pdfX: number, pdfY: number, page: number, canvasX: number, canvasY: number) => void;
}

const ZOOM_FACTOR = 1.79; // Define un factor de zoom mayor que 1

const PdfPageViewer = ({ fileUrl, pageNumber, width = 600, onClick }: PdfPageViewerPropsWithClick) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
  let renderTask: any = null;

    const renderPage = async () => {
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNumber);
      // Suma la rotación del viewport (usualmente 0) y la de la página
      const rotation = (page.rotate || 0) + (page.viewerRotation || 0);
      const viewport = page.getViewport({ 
        scale: (width / page.getViewport({ scale: 1 }).width) * ZOOM_FACTOR,
        rotation 
      });
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        renderTask = page.render({ canvasContext: context, viewport });
        try {
          await renderTask.promise;
        } catch (e) {
          // Si se cancela, ignora el error
        }
      }
    };
    renderPage();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [fileUrl, pageNumber, width]);

  const handleCanvasClick = async (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!onClick) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    
    // Obtener el PDF para calcular dimensiones reales
    try {
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      
      // Convertir coordenadas de canvas a coordenadas PDF
      // 1. Primero ajustar por el zoom
      const pdfX = x / ZOOM_FACTOR;
      const pdfY = y / ZOOM_FACTOR;
      
      // 2. Convertir desde coordenadas de canvas (origen arriba-izquierda) 
      //    a coordenadas PDF (origen abajo-izquierda)
      const finalPdfX = pdfX;
      const finalPdfY = viewport.height - pdfY; // Invertir Y
      
      onClick(finalPdfX, finalPdfY, pageNumber, x, y);
    } catch (error) {
      console.error('Error al convertir coordenadas:', error);
      // Fallback: usar coordenadas básicas
      const pdfX = x / ZOOM_FACTOR;
      const pdfY = y / ZOOM_FACTOR;
      onClick(pdfX, pdfY, pageNumber, x, y);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ borderRadius: 8, border: "1px solid #ddd" }}
      onClick={handleCanvasClick}
    />
  );
};

export default PdfPageViewer;