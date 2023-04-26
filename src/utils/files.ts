import * as fs from 'fs'
import scssTokenize from 'postcss-scss/lib/scss-tokenize'

const fileContents: Map<string, string> = new Map()
const fileAsInput: Map<string, Input> = new Map()

export function readFile(fileName: string): string {
    if (!fileContents.has(fileName)) fileContents.set(fileName, fs.readFileSync(fileName, 'utf8'))
    return fileContents.get(fileName)
}

class Input {
    public css: string

    constructor(css) {
        this.css = css.toString()
    }

    public error: () => 0
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

export class FakeTokenizer implements Tokenizer {
    index: number = 0
    private readonly tokens: TokenType[]

    constructor(tokens: TokenType[]) {
        this.tokens = tokens
    }

    nextToken(): TokenType {
        return this.tokens[this.index++]
    }

    endOfFile(): boolean {
        return this.index >= this.tokens.length
    }

    back(token?: TokenType) {
        this.index--
    }

    position(): number {
        return 0
    }
}

export function fakeTokenizer(tokens: TokenType[]): Tokenizer {
    return new FakeTokenizer(tokens)
}
