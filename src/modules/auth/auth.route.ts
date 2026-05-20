import { Router } from "express";

import { authController } from "./auth.controller.ts";
const router = Router()

export const authRoute = router

router.post('/signup', authController.createUser)