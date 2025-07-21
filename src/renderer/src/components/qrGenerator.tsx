import React, { useRef, useEffect } from "react";
import QRCode from "qrcode";
import { useAuth } from "../context/AuthContext";

type Props = {
  text: string;
  documentId: string;
  certId: string;
  certPassword: string;
};

const SignatureStamp: React.FC<Props> = ({ text, documentId, certId, certPassword }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { userName } = useAuth();

  useEffect(() => {
    const drawStamp = async () => {
      const timestamp = new Date().toISOString().substring(0, 10);
      const qrText = `Firma Electrónica:\n${userName}\n${text}\n${timestamp}\nPUCESE`;

      // Generar QR como dataURL
      const qrDataUrl = await QRCode.toDataURL(qrText, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 200,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Cargar la imagen QR
      const qrImg = new window.Image();
      qrImg.src = qrDataUrl;
      qrImg.onload = () => {
        ctx.font = "16px sans-serif";
        const lines = qrText.split("\n");
        const textWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
        const padding = 20;
        const width = qrImg.width + textWidth + padding;
        const height = Math.max(qrImg.height, lines.length * 22 + 20);

        canvas.width = width;
        canvas.height = height;

        // Dibujar QR
        ctx.drawImage(qrImg, 0, 0);

        // Dibujar texto a la derecha
        ctx.fillStyle = "#000";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        lines.forEach((line, i) => {
          ctx.fillText(line, qrImg.width + 10, 10 + i * 22);
        });
      };
    };

    drawStamp();
  }, [text, userName]);

  // Nueva función para enviar el PNG al backend
  const sendStampToBackend = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("stampImage", blob, "stamp.png");
      formData.append("documentId", documentId);
      formData.append("certId", certId);
      formData.append("certPassword", certPassword);

      await fetch("/api/firmar-con-estampa", {
        method: "POST",
        body: formData,
        // Si usas autenticación, agrega los headers necesarios
      });
      alert("Estampa enviada y PDF firmado.");
    }, "image/png");
  };

  return (
    <div>
      <canvas ref={canvasRef} style={{ border: "1px solid #ccc", background: "#fff" }} />
      <button onClick={sendStampToBackend}>Firmar PDF con esta estampa</button>
    </div>
  );
};

export default SignatureStamp;