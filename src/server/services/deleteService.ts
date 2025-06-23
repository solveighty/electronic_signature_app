import PdfDocument from '../models/PdfDocument';
import Certificate from '../models/Certificate';
import mongoose from 'mongoose';

/**
 * Elimina un documento PDF de la base de datos
 * @param documentId ID del documento a eliminar
 * @param userId ID del usuario para verificación de propiedad
 */
export const deletePdfDocumentFromDB = async (
  documentId: string,
  userId: string
): Promise<{
  success: boolean;
  message?: string;
  code?: number;
}> => {
  try {
    // Validar que el ID del documento sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return {
        success: false,
        message: 'ID de documento inválido',
        code: 400
      };
    }
    
    // Buscar el documento por ID
    const document = await PdfDocument.findById(documentId);
    
    if (!document) {
      return {
        success: false,
        message: 'Documento no encontrado',
        code: 404
      };
    }
    
    // Verificar que el documento pertenece al usuario
    if (document.userId !== userId) {
      return {
        success: false,
        message: 'No tienes permiso para eliminar este documento',
        code: 403
      };
    }
    
    // Eliminar el documento
    await PdfDocument.deleteOne({ _id: documentId });
    
    // console.log(`Documento PDF con ID ${documentId} eliminado correctamente por el usuario ${userId}`);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error al eliminar documento PDF:', error);
    return {
      success: false,
      message: 'Error interno al eliminar el documento',
      code: 500
    };
  }
};

/**
 * Elimina el certificado de un usuario
 * @param userId ID del usuario cuyo certificado se eliminará
 */
export const deleteCertificateFromDB = async (
  userId: string
): Promise<{
  success: boolean;
  message?: string;
  code?: number;
}> => {
  try {
    // Buscar certificados del usuario
    const certificates = await Certificate.find({ userId });
    
    if (certificates.length === 0) {
      return {
        success: false,
        message: 'No se encontró ningún certificado para eliminar',
        code: 404
      };
    }
    
    // Eliminar todos los certificados del usuario (solo debería haber uno)
    const deleteResult = await Certificate.deleteMany({ userId });
    
    //console.log(`Certificado(s) eliminado(s) para el usuario ${userId}. Cantidad: ${deleteResult.deletedCount}`);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error al eliminar certificado:', error);
    return {
      success: false,
      message: 'Error interno al eliminar el certificado',
      code: 500
    };
  }
};