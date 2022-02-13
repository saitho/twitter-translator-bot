import {TwitterApi} from "twitter-api-v2";
import EventEmitter from "events";
import {OAuthServer} from "./server";
import fs from "fs";

let client = new TwitterApi({
    clientId: process.env.CONSUMER_KEY as string,
    clientSecret: process.env.CONSUMER_SECRET
});

function requestOAuth(): EventEmitter {
    const oAuthServer = new OAuthServer({
        client: client,
        redirectUri: 'http://127.0.0.1:4114/oauth/verify/',
        scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
    })
    oAuthServer.start()
    const em = oAuthServer.getEventEmitter();
    em.addListener('started', async (startUrl: string) => {
        console.log('Please visit this URL to authenticate your Twitter account: ' + startUrl)
    })
    em.addListener('oauth_granted', async (loggedClient: TwitterApi, accessToken: string, refreshToken: string, expiresIn: number) => {
        fs.writeFileSync('./twitter-auth.token', JSON.stringify({
            accessToken,
            refreshToken
        }))
        oAuthServer.stop()
    })
    em.addListener('oauth_failed', async (errorMessage: string) => {
        console.log('Authentication error: ' + errorMessage)
        process.exit(1)
    })
    return em
}

export function getAuthenticatedClient(): Promise<TwitterApi> {
    return new Promise<TwitterApi>(async (resolve, reject) => {
        if (!fs.existsSync('./twitter-auth.token')) {
            requestOAuth()
                .addListener('oauth_granted', (loggedClient: TwitterApi) => {
                    resolve(loggedClient)
                })
                .addListener('oauth_failed', (error) => {
                    reject(error)
                })
            return
        }
        const tokens = fs.readFileSync('./twitter-auth.token').toString()
        const {accessToken, refreshToken} = JSON.parse(tokens)

        // Refresh token
        const {
            client: refreshedClient,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        } = await client.refreshOAuth2Token(refreshToken)
        if (!newRefreshToken) {
            console.error('Unable to renew access token')
            requestOAuth()
                .addListener('oauth_granted', (loggedClient: TwitterApi) => {
                    resolve(loggedClient)
                })
                .addListener('oauth_failed', (error) => {
                    reject(error)
                })
            return
        }
        console.log('Renewed token')
        fs.writeFileSync('./twitter-auth.token', JSON.stringify({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }))
        resolve(refreshedClient)
    })
}
