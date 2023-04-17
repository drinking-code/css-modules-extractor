import * as path from 'path'

import {tokenizeFile} from './files.js'
import {getSelectors, type ImportData, type Selector} from './get-selectors.js'
import {extractNames} from './extract-names.js'

// no ast
export function getNames(fileName: string) {
    fileName = path.resolve(fileName)
    const tokenizer = tokenizeFile(fileName)
    const seenImports: ImportData[] = []
    const selectors: Selector[] = []
    getSelectors(tokenizer, selectors, seenImports)
    extractNames(selectors, seenImports, fileName)
}
