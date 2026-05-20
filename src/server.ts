
import { initDB } from './db/index.ts';

import config from './config/index.ts';
import { app } from './app.ts';

const main = () => {

    initDB()
    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`)

    })
}
main()