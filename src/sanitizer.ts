export const sanitizerTags = ['sh', 'su', 'sw']

/**
 * @param text
 */
function sanitizeHashtags(text: string): string {
    // Replace hashtags as we do not want to translate them
    const hashTagRegex = /(#[^ !@#$%^&*(),.?":{}|<>]*)/g;
    const replacement = '<sh>$1</sh>';
    return text.replace(hashTagRegex, replacement);
}

/**
 * @param text
 */
function sanitizeUsers(text: string): string {
    const regex = /(?<!\w)@([\w+]{1,15})\b/g;
    const replacement = '<su>$1</su>';
    return text.replace(regex, replacement);
}

type FixedTranslations = any

export function buildFixedTranslationsFromEnv(): FixedTranslations {
    const obj: FixedTranslations = {}
    if (!('FIXED_TRANSLATIONS' in process.env)) {
        return obj
    }
    const list = JSON.parse(process.env.FIXED_TRANSLATIONS!) || [];
    for (const item of list) {
        if (!Array.isArray(item)) {
            continue
        }
        if (item.length !== 2) {
            continue
        }
        const [key, value] = item as string[]
        obj[key] = value
    }
    return obj
}

/**
 * @param text
 * @param fixedTranslations
 */
function sanitizeWhitelist(text: string, fixedTranslations: FixedTranslations = {}): string {
    for (const word of Object.keys(fixedTranslations)) {
        text = text.replace(word, `<sw>${word}</sw>`)
    }
    return text;
}

/**
 * @param tweetText
 * @param fixedTranslations
 */
export function unsanitizeTweetText(tweetText: string, fixedTranslations: FixedTranslations = {}): string {
    for (const tag of sanitizerTags) {
        tweetText = tweetText.replace(
            new RegExp(`(?:<${tag}>(.*?)<\/${tag}>)`, 'g'),
            (_, m: string): string => {
                if (tag === 'sw' && m in fixedTranslations) {
                    // pull text from fixedTranslation list
                    return fixedTranslations[m]
                }
                return m
            }
        )
    }
    return tweetText
}

/**
 * @param text
 * @param fixedTranslations
 */
export function sanitizeTweet(text: string, fixedTranslations: FixedTranslations = {}): string {
    let sanitizedText = text
    sanitizedText = sanitizeHashtags(sanitizedText)
    sanitizedText = sanitizeUsers(sanitizedText)
    sanitizedText = sanitizeWhitelist(sanitizedText, fixedTranslations)

    return sanitizedText
}
