import { Router } from "express";
import { issuesController } from "./issues.controller";
 

 
const router = Router()

export const issuesRoute = router

router.post('/', issuesController.createIssue)
 