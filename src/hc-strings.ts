import { load } from 'js-yaml'

type LocaleValue = string | Record<string, string>
type LocaleData = Record<string, LocaleValue>
var locale : string = "";

let data: LocaleData = {}


export async function loadLocale(lang: string): Promise<void> { // called by main.ts
    if (!lang || lang == "") {lang = "en"; console.log(`ERROR: loadLocale called with empty lang, defaulting to "en"`);}
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

// util for brute-force find-and-replace 
export function getMutationReplacements(): Record<string, string> {
    const val = data['mutation_replacements']
    return (typeof val === 'object' && val !== null) ? val : {}
}

//FIXME fallbacks for default_track_name are necessary because blank projects
//      are generated before the locale strings are even loaded!
const fallbacks: Record<string, string> = {
    "general.default_track_name": "Unnamed Track", // SIDE EFFECT : all locales will get the English string for the first track in a startup blank project
}

// ------------------------------------------------------------
// Character / Style localization lookups
// ------------------------------------------------------------

type LocalizedStyleNames = Record<string, string>

type CharacterEntry = {
    localized_name: string | null
    localized_style_names: LocalizedStyleNames
}

type CharacterData = Record<string, CharacterEntry>

const GENERIC_CHARACTER_KEY = "__generic__"

function getCharacterData(): CharacterData {
    const val = data["character_data"]
    return (typeof val === "object" && val !== null) ? (val as unknown as CharacterData) : {}
}

/**
 * Get the localized display name for a character.
 * @param character_name - The untranslated character display name (e.g. "四国めたん").
 * @returns The localized name, or the original character_name if no mapping is found.
 */
export function getLocalizedCharacterName(character_name: string): string {
    const characterData = getCharacterData()
    const entry = characterData[character_name]
    return entry?.localized_name ?? character_name
}

/**
 * Get the localized display name for a character-specific style.
 * @param character_name - The untranslated character display name (e.g. "四国めたん").
 * @param style_name - The untranslated style name (e.g. "ノーマル").
 * @returns The localized style name, or undefined if no mapping is found.
 * 
 * @note This function can return undefined, while its sister functions do not.
 */
export function getLocalizedCharacterStyleName(character_name: string, style_name: string): string | undefined {
    const characterData = getCharacterData()
    const entry = characterData[character_name]
    return entry?.localized_style_names?.[style_name]
}

/**
 * Get the localized display name for a generic (shared, non-character-specific) style.
 * @param style_name - The untranslated generic style name (e.g. "ノーマル").
 * @returns The localized style name, or the original style_name if no mapping is found.
 */
export function getLocalizedGenericStyleName(style_name: string): string {
    const characterData = getCharacterData()
    const entry = characterData[GENERIC_CHARACTER_KEY]
    return entry?.localized_style_names?.[style_name] ?? style_name
}