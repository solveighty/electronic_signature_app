export function canProceedToPassword(hasCertificate: boolean, selectedDocumentId: string | null) {
  return hasCertificate && !!selectedDocumentId;
}

export function canProceedToPosition(canProceedToPassword: boolean, certificatePassword: string) {
  return canProceedToPassword && certificatePassword.length >= 1;
}

export function canSignDocument(
  canProceedToPosition: boolean,
  signaturePosition: { page: string; x: string; y: string }
) {
  return (
    canProceedToPosition &&
    !!signaturePosition.page &&
    !!signaturePosition.x &&
    !!signaturePosition.y
  );
}