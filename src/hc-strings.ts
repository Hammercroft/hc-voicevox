import { load } from 'js-yaml'

type LocaleValue = string | Record<string, string>
type LocaleData = Record<string, LocaleValue>
var locale : string = "";

let data: LocaleData = {}


export async function loadLocale(lang: string): Promise<void> { // called by main.ts
    if (!lang || lang == "") lang = "en"; console.log(`ERROR: loadLocale called with empty lang, defaulting to "en"`)
    const res = await fetch(`/hc-locale/${lang}.yaml`)
    const text = await res.text()
    data = load(text) as LocaleData
    locale = lang;

    ;(window as any).localeAPI.setMutationReplacements(getMutationReplacements())
}

// NOTE no matter how much this script changes, this function signature should never change
/**
 * Get a localized string for the given key, with optional replacements for placeholders in the string.
 * @param key - The key for the localized string.
 * @param params - Optional parameters for placeholder replacements.
 * @returns The localized string.
 */
export function t(key: string, params?: Record<string, string>): string {
    const val = data[key]
    const fallback = fallbacks[key] // static map, defined below
    let str = (typeof val === 'string' ? val : null) ?? fallback ?? key
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            str = str.replaceAll(`{${k}}`, v)
        }
    }
    return str
}

export function getMutationReplacements(): Record<string, string> {
    const val = data['mutation_replacements']
    return (typeof val === 'object' && val !== null) ? val : {}
}

//FIXME fallbacks for default_track_name are necessary because blank projects
//      are generated before the locale strings are even loaded!
const fallbacks: Record<string, string> = {
    "general.default_track_name": "Unnamed Track", // SIDE EFFECT : all locales will get the English string for the first track in a startup blank project
}
