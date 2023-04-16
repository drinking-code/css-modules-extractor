import * as fs from 'fs'
import {Input} from 'postcss'
import scssTokenize from 'postcss-scss/lib/scss-tokenize'

const fileContents: Map<string, string> = new Map()
const fileAsInput: Map<string, Input> = new Map()
const tokenizedFiles: Map<string, ReturnType<typeof scssTokenize>> = new Map()

function getOrSetKey<K, V extends (...args: any) => any>(map: Map<any, any>, key: K, makeValue: V): ReturnType<V> {
    if (!map.has(key)) map.set(key, makeValue())
    return map.get(key)
}

function readFile(fileName: string): string {
    return getOrSetKey(fileContents, fileName, fs.readFileSync.bind(null, fileName, 'utf8'))
}

function fileToInput(fileName: string): Input {
    return new Input(readFile(fileName))
}

function getFileAsInput(fileName: string): string {
    return getOrSetKey(fileAsInput, fileName, fileToInput.bind(null, fileName))
}

function tokenizeFile(fileName: string): ReturnType<typeof scssTokenize> {
    return getOrSetKey(tokenizedFiles, fileName, scssTokenize.bind(null, getFileAsInput(fileName)))
}

const globalImport = Symbol.for('globalScope')

interface ImportData {
    file: string
    nameSpace: string | typeof globalImport
}

type Partial<T> = {
    [K in keyof T]?: T[K];
}

export function getNames(fileName: string/*, options?: GetNamesOptionsType*/)/*: string[]*/ {
    const tokenizer = tokenizeFile(fileName)
    const seenImports: ImportData[] = []
    const scope = {}
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        if (token[0] === 'at-word') {
            if (token[1] === '@use' || token[1] === '@import') {
                const importData: Partial<ImportData> = {nameSpace: globalImport}
                while (!tokenizer.endOfFile()) {
                    const token = tokenizer.nextToken()
                    if (token[0] === 'string') {
                        importData.file = token[1]
                    } else if (token[0] === 'word') {
                        if (token[1] === 'as') {
                            importData.nameSpace = null
                        } else if (importData.nameSpace === null) { // every word after "as"
                            importData.nameSpace = token[1] === '*' ? globalImport : token[1]
                        }
                    } else if (token[0] === ';') {
                        seenImports.push(importData as ImportData)
                        break;
                    }
                }
            }
        } else if (token[0] === 'word') {
            if (token[1].startsWith('#{')) {
                console.log(token[1])
            }
        }
    }
}
