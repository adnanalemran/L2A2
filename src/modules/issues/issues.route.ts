import { Router } from "express";
import { issuesController } from "./issues.controller.js";
import { authenticateToken } from "../../middleware/authenticateToken.js";
 

 
const router = Router()

export const issuesRoute = router

router.post('/', authenticateToken, issuesController.createIssue)
 