import express, { Application, Request, Response } from 'express'
import { globalErrorHandler } from './middleware/globalErrorHandler.js';
import { authRoute } from './modules/auth/auth.route.js';
 
export const app: Application = express()

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


// Global Error Handler
app.use(globalErrorHandler);