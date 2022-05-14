import deepl, {DeeplLanguages} from 'deepl'
import {sanitizerTags} from "./sanitizer";
import {logger} from "./logger";

/**
 * This function prepares a text for translation
 * @param text
 * @param textLang
 */
export function prepareText(text: string, textLang: string): string {
    // Ensure emojis on line are behind a finished sentence
    const textChunks = text.split('\n')

    const sentenceEndChar = ['ja', 'zh'].includes(textLang) ? '。' : '.'
    const emojiAtEndRegEx = /(?:([^.,;!?()\s]))\s?((?:\p{Emoji}|\s)+)$/u
    for (let i in textChunks) {
        if (!textChunks[i].match(emojiAtEndRegEx)) {
            continue
        }
        textChunks[i] = textChunks[i].replace(emojiAtEndRegEx, `$1${sentenceEndChar}$2`)
    }

    return textChunks.join('\n')
}

export default async function translate(sourceLang: string, targetLang: string, text: string): Promise<string>
{
    return new Promise<string>((resolve, reject) => {
        deepl({
            text: prepareText(text, sourceLang),
            free_api: true,
            tag_handling: ['xml'],
            ignore_tags: sanitizerTags,
            source_lang: sourceLang.toUpperCase() as DeeplLanguages,
            target_lang: targetLang.toUpperCase() as DeeplLanguages,
            auth_key: process.env.DEEPL_AUTH as string,
        })
            .then(result => {
                const text = result.data.translations[0].text
                logger.debug(`Translated text from ${sourceLang} to ${targetLang}: ${text}`)
                resolve(text)
            })
            .catch(reject);
    })
}
