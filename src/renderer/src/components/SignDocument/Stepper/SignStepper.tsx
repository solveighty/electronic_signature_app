import { Stepper } from '@mantine/core';
import DocumentSelectorStep from './Steps/DocumentSelectorStep';
import CertificatePasswordStep from './Steps/CertificatePasswordStep';
import SignaturePositionStep from './Steps/SignaturePositionStep';
import CompletedStep from './Steps/CompletedStep';

const SignStepper = ({
  logic,
  pdfSigner,
  securePdfUrl
}: {
  logic: any;
  pdfSigner: any;
  securePdfUrl: string | null;
}) => (
  <Stepper active={logic.active} onStepClick={logic.setActive} mb="xl">
    {/* Paso 1: Seleccionar documento */}
    <Stepper.Step
      label="Seleccionar documento"
      description="Elige un PDF para firmar"
      allowStepSelect={true}
    >
      <DocumentSelectorStep logic={logic} />
    </Stepper.Step>
    {/* Paso 2: Contraseña */}
    <Stepper.Step
      label="Contraseña"
      description="Ingresa la contraseña del certificado"
      allowStepSelect={!!logic.canProceedToPassword}
    >
      <CertificatePasswordStep logic={logic} />
    </Stepper.Step>
    {/* Paso 3: Posición de firma */}
    <Stepper.Step
      label="Posición de firma"
      description="Define dónde aparecerá la firma"
      allowStepSelect={!!logic.canProceedToPosition}
    >
      <SignaturePositionStep logic={logic} pdfSigner={pdfSigner} securePdfUrl={securePdfUrl} />
    </Stepper.Step>
    {/* Paso 4: Completado */}
    <Stepper.Completed>
      <CompletedStep logic={logic} />
    </Stepper.Completed>
  </Stepper>
);

export default SignStepper;