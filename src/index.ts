import {run} from "./run";
import {logger} from "./logger";
import {getAuthenticatedClient} from "./oauth/client";

(async () => {
    const authedClient = await getAuthenticatedClient()
    run(authedClient)
        .then(() => {
            process.exit()
        })
        .catch((error) => {
            logger.error(error)
            process.exit(-1)
        })
})();
