import React, { useRef, useEffect } from "react";
import QRCode from "qrcode";
import { useAuth } from "../context/AuthContext";

type Props = {
  text: string;
};

const SignatureStamp: React.FC<Props> = ({ text }) => {
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
        const textWidth = 200;
        const width = qrImg.width + textWidth;
        const height = qrImg.height;
        canvas.width = width;
        canvas.height = height;

        // Dibujar QR
        ctx.drawImage(qrImg, 0, 0);

        // Dibujar texto a la derecha
        ctx.fillStyle = "#000";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        // Dividir texto en líneas
        const lines = qrText.split("\n");
        const lineHeight = 22;
        lines.forEach((line, i) => {
          ctx.fillText(line, qrImg.width + 10, 10 + i * lineHeight);
        });
      };
    };

    drawStamp();
  }, [text, userName]);

  return (
    <canvas ref={canvasRef} style={{ border: "1px solid #ccc" }} />
  );
};

export default SignatureStamp;