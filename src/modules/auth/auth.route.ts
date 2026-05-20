import { Router } from "express";

import { authController } from "./auth.controller.js";
const router = Router()

export const authRoute = router

router.post('/signup', authController.createUser)
router.post('/login', authController.loginUser)