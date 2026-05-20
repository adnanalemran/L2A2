import { Router } from "express";
import { issuesController } from "./issues.controller";
import { authenticateToken } from "../../middleware/authenticateToken";



const router = Router()

export const issuesRoute = router


router.post('/', authenticateToken, issuesController.createIssue)

router.get('/',  issuesController.getAllIssues)

router.get('/:id',  issuesController.singleIssue)

router.patch('/:id', authenticateToken, issuesController.updateIssue)

router.delete('/:id', authenticateToken, issuesController.deleteIssue)
