import deepl, {DeeplLanguages} from 'deepl'
import {sanitizerTags} from "./sanitizer";

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
            .then(result => resolve(result.data.translations[0].text))
            .catch(reject);
    })
}
