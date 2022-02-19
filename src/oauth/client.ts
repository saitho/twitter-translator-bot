import {TwitterApi} from "twitter-api-v2";
import EventEmitter from "events";
import {OAuthServer} from "./server";
import fs from "fs";
import {logger} from "../logger";
import * as path from "path";

const clientId = process.env.CONSUMER_KEY || ''
const clientSecret = process.env.CONSUMER_SECRET || ''

const tokenPath = path.join(__dirname + '..', '..', 'data', 'twitter-auth.token')

if (!clientId.length || !clientSecret.length) {
    logger.error('Missing CONSUMER_KEY or CONSUMER_SECRET environment variable!')
    process.exit(1)
}

let client = new TwitterApi({clientId, clientSecret});
const oAuthHost = process.env.OAUTH_HOST || '127.0.0.1:4114'

function requestOAuth(): EventEmitter {
    const oAuthServer = new OAuthServer({
        client: client,
        redirectUri: `http://${oAuthHost}/oauth/verify/`,
        scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
    })
    oAuthServer.start()
    const em = oAuthServer.getEventEmitter();
    em.addListener('started', async (startUrl: string) => {
        logger.info('Please visit this URL to authenticate your Twitter account: ' + startUrl)
    })
    em.addListener('oauth_granted', async (loggedClient: TwitterApi, accessToken: string, refreshToken: string, expiresIn: number) => {
        fs.writeFileSync(tokenPath, JSON.stringify({
            accessToken,
            refreshToken
        }))
        oAuthServer.stop()
    })
    em.addListener('oauth_failed', async (errorMessage: string) => {
        logger.error('Authentication error: ' + errorMessage)
        process.exit(1)
    })
    return em
}

export function getAuthenticatedClient(): Promise<TwitterApi> {
    return new Promise<TwitterApi>(async (resolve, reject) => {
        if (!fs.existsSync(tokenPath)) {
            logger.debug(`No twitter-auth.token file found. Requesting OAuth`)
            requestOAuth()
                .addListener('oauth_granted', (loggedClient: TwitterApi) => {
                    resolve(loggedClient)
                })
                .addListener('oauth_failed', (error) => {
                    reject(error)
                })
            return
        }
        const tokens = fs.readFileSync(tokenPath).toString()
        const {accessToken, refreshToken} = JSON.parse(tokens)

        // Refresh token
        const {
            client: refreshedClient,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        } = await client.refreshOAuth2Token(refreshToken)
        if (!newRefreshToken) {
            logger.error('Unable to renew access token')
            requestOAuth()
                .addListener('oauth_granted', (loggedClient: TwitterApi) => {
                    resolve(loggedClient)
                })
                .addListener('oauth_failed', (error) => {
                    reject(error)
                })
            return
        }
        logger.debug('Renewed token')
        fs.writeFileSync(tokenPath, JSON.stringify({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }))
        resolve(refreshedClient)
    })
}
