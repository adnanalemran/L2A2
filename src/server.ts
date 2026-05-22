
import { initDB } from './db/index';

import config from './config/index';
import { app } from './app';

const main = async () => {
    await initDB()
    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`)
    })
}
main()