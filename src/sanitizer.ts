export const sanitizerTags = ['sh', 'su']

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

/**
 * @param tweetText
 */
export function unsanitizeTweetText(tweetText: string): string {
    for (const tag of sanitizerTags) {
        tweetText = tweetText.replace(
            new RegExp(`(?:<${tag}>(.*?)<\/${tag}>)`, 'g'),
            '$1'
        )
    }
    return tweetText
}

/**
 * @param text
 */
export function sanitizeTweet(text: string): string {
    let sanitizedText = text
    sanitizedText = sanitizeHashtags(sanitizedText)
    sanitizedText = sanitizeUsers(sanitizedText)

    return sanitizedText
}
