
import { initDB } from './db/index.js';

import config from './config/index.js';
import { app } from './app.js';

const main = () => {

    initDB()
    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`)

    })
}
main()