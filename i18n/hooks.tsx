import { useRouter } from 'next/router'

import _en from './locales/en'
import _ja from './locales/ja'

const defaultLocale = _en;
const en = { ...defaultLocale, ..._en };
const ja = { ...defaultLocale, ..._ja };

function t(locale: string = '@default') {
    switch(locale) {
        case 'en': return en;
        case 'ja': return ja;
        default: return defaultLocale;
    }
}

export function useLocale() {
    const { locale } = useRouter();
    return { locale, t: t(locale) };
}