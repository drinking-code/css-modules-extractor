export type LocalsConventionFunction = (
    originalClassName: string,
    generatedClassName: string,
    inputFile: string
) => string;

export function conventionaliseLocals(names: { [local: string]: string }, options: {
    localsConvention?: "camelCase" | "camelCaseOnly" | "dashes" | "dashesOnly" | LocalsConventionFunction;
}, fileName: string) {
    if (typeof options.localsConvention === 'string') {
        let transform: (string: string) => string
        if (options.localsConvention.startsWith('camelCase')) {
            transform = camelCase
        } else if (options.localsConvention.startsWith('dashes')) {
            transform = camelCaseDashes
        }
        const deleteOriginal = options.localsConvention.endsWith('Only')
        for (const local in names) {
            names[transform(local)] = names[local]
            if (deleteOriginal)
                delete names[local]
        }
    } else if (typeof options.localsConvention === 'function') {
        for (const local in names) {
            names[options.localsConvention(local, names[local], fileName)] = names[local]
            delete names[local]
        }
    }
    return names
}

const isNotDash = char => char !== '-'
const isNotWordChar = char => {
    const charCode = char.charCodeAt(0)
    return !(
        // 0-9
        (0x30 <= charCode && charCode <= 0x39) ||
        // A-Z
        (0x41 <= charCode && charCode <= 0x5a) ||
        // a-z
        (0x61 <= charCode && charCode <= 0x7a)
    )
}

function camelCaseAbstract(str: string, isWordPart: (char: string) => boolean): string {
    let camelised = '', capNext = false
    for (let i = 0; i < str.length; i++) {
        const char = capNext ? str[i].toUpperCase() : str[i]
        capNext = false
        if (!isWordPart(char)) camelised += char
        else capNext = true
    }
    return camelised
}

function camelCase(str: string): string {
    return camelCaseAbstract(str, isNotWordChar)
}

function camelCaseDashes(str: string): string {
    return camelCaseAbstract(str, isNotDash)
}
