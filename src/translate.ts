import deepl, {DeeplLanguages} from 'deepl'
import {sanitizerTags} from "./sanitizer";
import {logger} from "./logger";

export default async function translate(sourceLang: string, targetLang: string, text: string): Promise<string>
{
    return new Promise<string>((resolve, reject) => {
        deepl({
            text: text,
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
