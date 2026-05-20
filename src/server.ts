
import { application } from "express";
 
import config from './config/index.ts';
 import { app } from './app.ts';

const main = () => {
    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`)

    })
}
main()