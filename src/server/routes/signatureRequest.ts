import { Router } from "express";
import { createSignatureRequest, getSignatureRequestsForUser, completeSignatureRequest } from "../controllers/signatureRequestController";

const router = Router();

// POST /signature-request
router.post("/signature-request", createSignatureRequest);

// GET /signature-requests/:userId
router.get("/signature-requests/:userId", getSignatureRequestsForUser);

// POST /signature-request/:id/complete
router.post("/signature-request/:id/complete", completeSignatureRequest);

export default router;
