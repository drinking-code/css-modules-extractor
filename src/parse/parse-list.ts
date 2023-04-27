import {TokenType} from '../utils/files.js'

export function parseList(tokens: TokenType[]) {
    const list: (TokenType | string)[] = tokens
    for (let i = list.length - 1; i >= 0; i--) { // reverse to not skip values
        const token = list[i]
        if (token[0] === 'space' || token[1] === ',' || token[1] === '/') {
            delete list[i]
        } else {
            if (token[0] === 'string')
                list[i] = token[1].slice(1, -1)
            else
                list[i] = token[1]
        }
    }
    filterEmptyItemsInPlace(list)
    return list as string[]
}

function filterEmptyItemsInPlace(array: any[]) {
    let removedCount = 0
    for (let i = 0; i < array.length; i++) {
        if (array[i] === undefined) {
            for (let j = i + 1; j < array.length; j++) {
                array[j - 1] = array[j]
            }
            removedCount++
            i--
        }
    }
    array.length -= removedCount
}
