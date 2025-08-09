import { Router } from "express";
import { sendFriendRequest, acceptFriendRequest, getFriendsAndRequests, getAllNonAdminUsers } from "../controllers/friendController";

const router = Router();

// POST /friend-request
router.post("/friend-request", sendFriendRequest);

// POST /friend-request/accept
router.post("/friend-request/accept", acceptFriendRequest);

// GET /friends/:id
router.get("/friends/:id", getFriendsAndRequests);

// GET /users
router.get("/users", getAllNonAdminUsers);

export default router;
