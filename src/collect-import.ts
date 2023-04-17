import {type ImportData} from './get-selectors.js'

export const globalImport = Symbol.for('globalScope')

export function collectImport(tokenizer, importData: Partial<ImportData>, seenImports: ImportData[]) {
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
