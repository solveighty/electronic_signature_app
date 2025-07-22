import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { PdfPageViewerProps } from "./types/pdfPageViewer";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

interface PdfPageViewerPropsWithClick extends PdfPageViewerProps {
  onClick?: (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void;
}

const ZOOM_FACTOR = 1.79; // Define un factor de zoom mayor que 1

const PdfPageViewer = ({ fileUrl, pageNumber, width = 600, onClick }: PdfPageViewerPropsWithClick) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let renderTask: any = null;
    let cancelled = false

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
      cancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [fileUrl, pageNumber, width]);

  return (
    <canvas
      ref={canvasRef}
      style={{ borderRadius: 8, border: "1px solid #ddd" }}
      onClick={onClick}
    />
  );
};

export default PdfPageViewer;