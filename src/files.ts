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

export function tokenizeFile(fileName: string): ReturnType<typeof scssTokenize> {
    return getOrSetKey(tokenizedFiles, fileName, scssTokenize.bind(null, getFileAsInput(fileName)))
}
