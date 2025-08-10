import { Router } from 'express';
import { submitCertificateRequest, listPendingCertificateRequests, approveCertificateRequest, rejectCertificateRequest } from '../controllers/certificateRequestController';

const router = Router();

// User submits a certificate request
router.post('/certificate-requests', submitCertificateRequest);

// Admin lists pending requests
router.get('/certificate-requests', listPendingCertificateRequests);

// Admin approves request (generates certificate)
router.post('/certificate-requests/:id/approve', approveCertificateRequest);

// Admin rejects request
router.post('/certificate-requests/:id/reject', rejectCertificateRequest);

export default router;
