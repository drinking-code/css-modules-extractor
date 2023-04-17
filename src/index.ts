import {collectImport, globalImport} from './collect-import.js'
import {spaceSymbol, trimSentence} from './trim-sentence.js'
import {collectInclude} from './collect-include'
import {tokenizeFile} from './files'

export interface ImportData {
    file: string
    nameSpace: string | typeof globalImport
}

type Partial<T> = {
    [K in keyof T]?: T[K];
}

export type Sentence = Array<typeof spaceSymbol | string>

interface Selector {
    content: Sentence,
    parent?: Selector,
    children?: Selector[]
}

// no ast
export function getNames(fileName: string) {
    const tokenizer = tokenizeFile(fileName)
    const seenImports: ImportData[] = []
    // const scope = {}
    const selectors: Selector[] = []
    let parentSelector
    let sentence: Sentence = []
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        // console.log(token)
        if (token[0] === 'at-word') {
            if (token[1] === '@use' || token[1] === '@import') {
                collectImport(tokenizer, {nameSpace: globalImport}, seenImports)
            } else if (token[1] === '@include') {
                collectInclude(tokenizer)
            } else if (token[1] === '@at-root') {
                // todo @at-root (maybe not needed)
            }
        } else if (token[0] === 'word') {
            sentence.push(token[1])
            /*if (token[1].startsWith('#{')) { todo: put this in selector builder
                console.log(token[1].slice(2, -1))
            }*/
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
    console.log(selectors[0].children, seenImports)
}
