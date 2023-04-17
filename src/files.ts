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

export function readFile(fileName: string): string {
    if (!fileContents.has(fileName)) fileContents.set(fileName, fs.readFileSync(fileName, 'utf8'))
    return fileContents.get(fileName)
}

function fileToInput(fileContents: string): Input {
    return new Input(fileContents)
}

function getScssAsInput(fileContents: string): Input {
    if (!fileAsInput.has(fileContents)) fileAsInput.set(fileContents, fileToInput(fileContents))
    return fileAsInput.get(fileContents)
}

export interface Tokenizer {
    back: (token: TokenType) => void,
    nextToken: (opts?: NextTokenOptions) => TokenType,
    endOfFile: () => boolean,
    position: () => number,
}

interface NextTokenOptions {
    ignoreUnclosed: boolean
}

type TokenDescriptorType =
    'space' | '[' | ']' | '{' | '}' | ':' | ';' | ')' | 'word' | 'brackets' | '(' | 'string' | 'at-word' | 'comment'
export type TokenType = [TokenDescriptorType, string, number?, number?, 'inline'?]

export function tokenizeFile(fileName: string): Tokenizer {
    return scssTokenize(getScssAsInput(readFile(fileName)))
}

export function tokenizeExpression(expression: string): Tokenizer {
    return scssTokenize(getScssAsInput(expression))
}

export function fakeTokenizer(tokens: TokenType[]): Tokenizer {
    let index = 0
    return {
        nextToken: () => tokens[index++],
        endOfFile: () => index >= tokens.length,
    } as Tokenizer
}
