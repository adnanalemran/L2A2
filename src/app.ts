import express, { Application, Request, Response } from 'express'
import { globalErrorHandler } from './middleware/globalErrorHandler.js';

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


app.use(globalErrorHandler);