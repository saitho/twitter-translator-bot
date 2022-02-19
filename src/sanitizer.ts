// @ts-ignore
import xliff from 'xliff'
import fs from "fs";
import {logger} from "./logger";

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
    if (!('FIXED_TRANSLATIONS_FILE' in process.env)) {
        return obj
    }
    const filePath = process.env.FIXED_TRANSLATIONS_FILE as string
    const fileContents = fs.readFileSync(filePath).toString()
    xliff.xliff2js(fileContents, (err: Error, res: any) => {
        if (err) {
            logger.error(err)
            process.exit(1)
            return
        }
        for (const translationId of Object.keys(res.resources.translations)) {
            const item = res.resources.translations[translationId]
            if (!item.source || !item.target) {
                continue
            }
            obj[item.source] = item.target
        }
    })
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
