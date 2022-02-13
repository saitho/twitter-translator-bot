// Start OAuth server on port 4114
import express from 'express';
import EventEmitter from "events";
import {TwitterApi} from "twitter-api-v2";

type ServerOptions = {
    client: TwitterApi;
    redirectUri: string;
    scopes: string[];
}

let activeAuth = {
    codeVerifier: '',
    state: ''
}

export class OAuthServer {
    protected server: express.Express;
    protected router = express.Router();
    protected em = new EventEmitter();
    protected serverStarted = false;
    protected oAuthClientOptions: ServerOptions;

    constructor(options: ServerOptions) {
        this.server = express()
        this.oAuthClientOptions = options

        this.router.route('/oauth/start').get(async (req: express.Request, res: express.Response) => {
            const { url, codeVerifier, state } = options.client.generateOAuth2AuthLink(
                options.redirectUri as string,
                { scope: options.scopes }
            );
            activeAuth.state = state
            activeAuth.codeVerifier = codeVerifier
            res.redirect(url)
        });
        this.router.route('/oauth/verify').get(async (req: express.Request, res: express.Response) => {
            // Exact state and code from query string
            const { state, code } = req.query;

            if (!activeAuth.codeVerifier || !state || !code) {
                this.em.emit('oauth_failed', new Error('You denied the app or your session expired!'));
                return res.status(400).send('You denied the app or your session expired!');
            }
            if (state !== activeAuth.state) {
                this.em.emit('oauth_failed', new Error('Stored tokens didnt match!'));
                return res.status(400).send('Stored tokens didnt match!');
            }

            options.client.loginWithOAuth2({
                code: code as string,
                codeVerifier: activeAuth.codeVerifier as string,
                redirectUri: options.redirectUri as string
            })
                .then(({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
                     res.send('<script>window.close();</script>Token received. You can close this window now.');
                    this.em.emit('oauth_granted', loggedClient, accessToken, refreshToken, expiresIn);
                })
                .catch((error) => {
                    res.status(403).send('Invalid verifier or access tokens!')
                    this.em.emit('oauth_failed', error);
                });
        });
        this.server.use(this.router)
    }

    public getEventEmitter(): EventEmitter {
        return this.em;
    }

    public start(): void {
        const startUrl = 'http://localhost:4114/oauth/start'
        if (this.serverStarted) {
            this.em.emit('started', startUrl);
            return;
        }
        const server = this.server.listen(4114,() => {
            this.serverStarted = true;
            console.log('OAuth server started')
            this.em.emit('started', startUrl);
            this.em.addListener('stop', () => {
                if (!this.serverStarted) {
                    return;
                }
                server.close();
                console.log('OAuth server stopped')
                this.serverStarted = false;
            })
        });
    }

    public stop(): void {
        this.em.emit('stop')
    }
}
