import {tokenizeFile} from './files.js'
import {getSelectors, type ImportData, type Selector} from './get-selectors.js'

// no ast
export function getNames(fileName: string) {
    const tokenizer = tokenizeFile(fileName)
    const seenImports: ImportData[] = []
    const selectors: Selector[] = []
    getSelectors(tokenizer, seenImports, selectors)
    console.log(selectors[0].children, seenImports)
}
