import {resolveMixin} from './mixins.js'
import {globalImport} from './collect-import.js'
import {type ImportData, type Selector} from './get-selectors.js'

export function collectInclude(tokenizer, parentSelector: Selector, seenImports: ImportData[], fileName: string) {
    let bracketLevel = 0
    let mixinName = '', mixinArgs = ''
    while (!tokenizer.endOfFile()) {
        const token = tokenizer.nextToken()
        if (token[0] === 'word') {
            mixinName += token[1]
        } else if (token[0] === 'brackets') {
            mixinArgs += token[1]
        } else if (token[0] === '{') {
            bracketLevel++
        } else if (token[0] === '}') {
            bracketLevel--
            if (bracketLevel === 0)
                break
        } else if (bracketLevel === 0 && token[0] === ';') {
            break
        }
    }
    const isScoped = mixinName.includes('.')
    const namespace = isScoped
        ? mixinName.substring(0, mixinName.indexOf('.'))
        : globalImport
    mixinName = isScoped
        ? mixinName.substring(mixinName.indexOf('.') + 1)
        : mixinName
    resolveMixin(mixinName, namespace, parentSelector, seenImports, fileName)
}
