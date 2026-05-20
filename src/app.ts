import express from 'express'
import type { Application, Request, Response } from 'express'
import { globalErrorHandler } from './middleware/globalErrorHandler';
import { authRoute } from './modules/auth/auth.route';
import { issuesRoute } from './modules/issues/issues.route';
 
export const app: Application = express()

// Middleware
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({ extended: true })) 

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        "status": "success",
        "data": "Server running now!"
    })
})


// Importing Routes
app.use('/api/auth', authRoute)
app.use('/api/issues', issuesRoute)

// Global Error Handler
app.use(globalErrorHandler);