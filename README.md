# Twitter Translator Bot

Build: `npm build`

Usage (environment variables required!): `node dist/index.js`

## Environment variables

* `CONSUMER_KEY` – Twitter API consumer key
* `CONSUMER_SECRET` – Twitter API consumer secret
* `DEEPL_AUTH` - DeepL API authentication token
* `TWITTER_ACCOUNTS` - Comma-separated list of Twitter handles to observe and translate
* `TARGET_LANGUAGE` - Target language to translate to; default: EN
  * Supported languages:
    * BG
    * CS
    * DA
    * DE
    * EL
    * EN-GB
    * EN-US
    * EN
    * ES
    * ET
    * FI
    * FR
    * HU
    * IT
    * JA
    * LT
    * LV
    * NL
    * PL
    * PT-PT
    * PT-BR
    * PT
    * RO
    * RU
    * SK
    * SL
    * SV
    * ZH
* `FIXED_TRANSLATIONS_FILE` - Path to XLF file containing the fixed translations
  * Example: `FIXED_TRANSLATIONS_FILE=./translations.xlf` (see `translations.xlf` in this repository for an example)

