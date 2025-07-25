import React, { useRef, useEffect } from "react";
import QRCode from "qrcode";
import { useAuth } from "../../context/AuthContext";
import { QrGeneratorProps } from "./types/qrGenerator";


interface SignatureStampProps extends QrGeneratorProps {
  onStampReady?: (stampImageBase64: string) => void;
}

const SignatureStamp: React.FC<SignatureStampProps> = ({ documentId, certId, certPassword, onStampReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { userName, token } = useAuth();

  useEffect(() => {
    const drawStamp = async () => {
      const timestamp = new Date().toISOString().substring(0, 10);
      const qrText = `Firma Electrónica:\n${userName}\n${timestamp}\nPUCESE`;

      const qrDataUrl = await QRCode.toDataURL(qrText, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 120,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const qrImg = new window.Image();
      qrImg.src = qrDataUrl;
      qrImg.onload = () => {
        ctx.font = "14px sans-serif";
        const lines = qrText.split("\n");
        const textWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
        const padding = 10;
        const width = qrImg.width + textWidth + padding;
        const height = Math.max(qrImg.height, lines.length * 18 + 10);

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(qrImg, 0, 0);

        ctx.fillStyle = "#000";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        lines.forEach((line, i) => {
          ctx.fillText(line, qrImg.width + 8, 8 + i * 18);
        });

        // Convert canvas to base64 for preview and firma
        const stampImageBase64 = canvas.toDataURL("image/png");
        if (onStampReady) onStampReady(stampImageBase64);
        // Para depuración
        console.log("Estampa generada para previsualización:", {
          documentId,
          certId,
          stampGenerated: !!stampImageBase64
        });
      };
    };

    drawStamp();
  }, [userName, documentId, certId, certPassword, token, onStampReady]);

  return (
    <div>
      <canvas ref={canvasRef} id="signature-stamp-canvas" style={{ border: "1px solid #ccc", background: "#fff" }} />
    </div>
  );
};

export default SignatureStamp;