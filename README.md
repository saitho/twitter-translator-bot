# Twitter Translator Bot

Build: `npm build`

Usage (environment variables required!): `node dist/index.js`

## Environment variables

* `CONSUMER_KEY` – Twitter API consumer key
* `CONSUMER_SECRET` – Twitter API consumer secret
* `DEEPL_AUTH` - DeepL API authentication token
* `TWITTER_ACCOUNTS` - Comma-separated list of Twitter handles to observe and translate
* `TARGET_LANGUAGE` - Target language to translate to; default: EN
  * Supported languages: BG
    * CS, DA, DE, EL, EN-GB, EN-US, EN, ES, ET, FI, FR, HU, IT, JA, LT, LV, NL, PL, PT-PT, PT-BR, PT, RO, RU, SK, SL, SV, ZH
* `FIXED_TRANSLATIONS_FILE` - Path to XLF file containing the fixed translations
  * Example: `FIXED_TRANSLATIONS_FILE=./translations.xlf` (see `translations.xlf` in this repository for an example)
* `TRANSLATABLE_MATCH_EXPRESSION` - regular expression that needs to be matched in order for a text to get translated (default: `[a-zA-Z]+`)

## Docker

Example docker-compose.yml

```yaml
version: "2"
services:
  app:
    image: saitho/twitter-translator-bot:latest
    restart: unless-stopped
    environment:
      - TWITTER_ACCOUNTS=saitho95
      - DEEPL_AUTH=YOUR_DEEPL_AUTHTOKEN
      - CONSUMER_KEY=YOUR_TWITTER_KEY
      - CONSUMER_SECRET=YOUR_TWITTER_SECRET
      - LOGLEVEL=info
    volumes:
      - ./data:/data
      - ./logs:/logs
```

_Note:_ On first run it establishes OAuth2 access. Therefore you need to expose the port 4114 to the outside.
Make sure to configure the public IP and port as redirect URL on Twitter and also set it in `OAUTH_HOST` environment variable.

Alternatively, initialize it outside of Docker and copy the `data/twitter-auth.token` file in the data directory mounted by Docker.
