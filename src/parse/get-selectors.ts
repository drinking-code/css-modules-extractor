import {collectImport, globalImport} from './collect-import.js'
import {spaceSymbol, trimSentence} from './trim-sentence.js'
import {collectInclude} from './collect-include.js'

export interface ImportData {
    file: string
    nameSpace: string | typeof globalImport
    type: 'use' | 'import' | 'forward'
}

export type Sentence = Array<typeof spaceSymbol | string>

export interface Selector {
    content: Sentence,
    parent?: Selector,
    children?: Selector[]
}

export function getSelectors(tokenizer, selectors: Selector[], seenImports: ImportData[]) {
    let parentSelector
    let sentence: Sentence = []
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        // console.log(token)
        if (token[0] === 'at-word') {
            if (token[1] === '@use' || token[1] === '@import') {
                const importData: Partial<ImportData> = {
                    nameSpace: globalImport,
                    type: token[1].substring(1)
                }
                collectImport(tokenizer, importData)
                seenImports.push(importData as ImportData)
            } else if (token[1] === '@include') {
                collectInclude(tokenizer)
            } else if (token[1] === '@at-root') {
                // todo @at-root (maybe not needed)
            }
        } else if (token[0] === 'word') {
            sentence.push(token[1])
        } else if (token[0] === 'space') {
            sentence.push(spaceSymbol)
        } else if (token[0] === '}' || token[0] === ';') {
            sentence = []
            if (token[0] === '}') {
                // move up in tree
                parentSelector = parentSelector?.parent
            }
        } else if (token[0] === '{') {
            // move down in tree
            const child = {
                content: trimSentence(sentence),
                parent: parentSelector
            }
            if (!parentSelector) {
                selectors.push(child)
            } else {
                parentSelector.children ??= []
                parentSelector.children.push(child)
            }
            parentSelector = child
            sentence = []
        }
    }
}
