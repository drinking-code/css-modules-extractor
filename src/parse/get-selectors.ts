import {collectImport, globalImport} from './collect-import.js'
import {spaceSymbol, trimSentence} from './trim-sentence.js'
import {collectInclude} from './collect-include.js'
import {collectEach, collectFor} from './collect-loop.js'
import type LocalVars from './local-vars.js'
import {collectPossibleVariable} from './variables.js'
import {getNewId} from './identifiers.js'

export interface ImportData {
    file: string
    nameSpace: string | typeof globalImport
    type: 'use' | 'import' | 'forward'
}

export type Sentence = Array<typeof spaceSymbol | string>

export interface Selector {
    content: Sentence,
    scopeId: number,
    parent?: Selector,
    children?: Selector[]
    loopOver?: string,
    loopAs?: string | string[],
}

export function getSelectors(tokenizer, selectors: Selector[], seenImports: ImportData[], fileName: string, localVars: LocalVars, scopeId?: number) {
    let parentSelector: Selector
    let sentence: Sentence = []
    scopeId ??= getNewId()
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        if (token[0] === 'at-word') {
            if (token[1] === '@use' || token[1] === '@import') {
                const importData: Partial<ImportData> = {
                    nameSpace: globalImport,
                    type: token[1].substring(1)
                }
                collectImport(tokenizer, importData)
                seenImports.push(importData as ImportData)
            } else if (token[1] === '@include') {
                // todo what if this is not inside a selector (in global scope)
                collectInclude(tokenizer, parentSelector, seenImports, fileName, localVars)
            } else if (token[1] === '@at-root') {
                // todo @at-root (maybe not needed)
            } else if (token[1] === '@for') {
                // todo impl class names inside @for
                collectFor(tokenizer, parentSelector)
            } else if (token[1] === '@each') {
                // todo impl class names inside @each
                collectEach(tokenizer, parentSelector, seenImports, fileName, localVars)
            }
        } else if (token[0] === 'word' || token[0] === ':') {
            sentence.push(token[1])
        } else if (token[0] === 'space') {
            sentence.push(spaceSymbol)
        } else if (token[0] === '}' || token[0] === ';') {
            sentence = []
            if (token[0] === '}') {
                // move up in tree
                scopeId = parentSelector?.scopeId
                parentSelector = parentSelector?.parent
            }
        } else if (token[0] === '{') {
            // move down in tree
            const child: Selector = {
                content: trimSentence(sentence),
                scopeId,
                parent: parentSelector
            }
            if (!parentSelector) {
                selectors.push(child)
            } else {
                parentSelector.children ??= []
                parentSelector.children.push(child)
            }
            scopeId = getNewId()
            parentSelector = child
            sentence = []
        }
        if (collectPossibleVariable(tokenizer, token, localVars, scopeId))
            sentence = []
    }
}
