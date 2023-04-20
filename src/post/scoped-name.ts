import genericNames from 'generic-names'

import {readFile} from '../utils/files.js'

export type GenerateScopedNameFunction = (name: string, filename: string, css: string) => string;

export function scopeNames(names: {[local: string]: string}, options: {
    generateScopedName?: string | GenerateScopedNameFunction,
    hashPrefix?: string
}, fileName: string) {
    const css = readFile(fileName)
    if (typeof options.generateScopedName === 'function') {
        for (const namesKey in names) {
            names[namesKey] = options.generateScopedName(names[namesKey].substring(1), fileName, css)
        }
    } else if (typeof options.generateScopedName === 'string') {
        const nameGenerator = genericNames(options.generateScopedName, {
            context: process.cwd(),
            hashPrefix: options.hashPrefix,
        })
        for (const namesKey in names) {
            names[namesKey] = nameGenerator(names[namesKey].substring(1), fileName)
        }
    } else {
        const hash = stringHash(css).toString(36).substring(0, 5)
        for (const namesKey in names) {
            // from https://github.com/madyankin/postcss-modules/blob/325f0b33f1b746eae7aa827504a5efd0949022ef/src/scoping.js
            // but compatible
            names[namesKey] = `_${names[namesKey].substring(1)}_${hash}`
        }
    }
}

// https://github.com/darkskyapp/string-hash/blob/master/index.js
function stringHash(str) {
    let hash = 5381, i = str.length
    while (i) {
        hash = (hash * 33) ^ str.charCodeAt(--i)
    }
    return hash >>> 0
}
