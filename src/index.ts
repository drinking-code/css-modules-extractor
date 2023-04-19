import * as path from 'path'

import {tokenizeFile} from './utils/files.js'
import {getSelectors, type ImportData, type Selector} from './parse/get-selectors.js'
import {extractNames} from './parse/extract-names.js'
import {type GenerateScopedNameFunction, scopeNames} from './post/scoped-name.js'
import {conventionaliseLocals, type LocalsConventionFunction} from './post/locals-convention.js'

export interface Options {
    localsConvention?: "camelCase" | "camelCaseOnly" | "dashes" | "dashesOnly" | LocalsConventionFunction;

    // scopeBehaviour?: "global" | "local";
    // globalModulePaths?: RegExp[];

    generateScopedName?: string | GenerateScopedNameFunction;

    hashPrefix?: string;
    // exportGlobals?: boolean;
    // root?: string;

    // Loader?: typeof Loader;

    // resolve?: (file: string, importer: string) => string | null | Promise<string | null>;
}

export default function getNames(fileName: string, options: Options = {}) { // no ast
    fileName = path.resolve(fileName)

    const tokenizer = tokenizeFile(fileName)
    const seenImports: ImportData[] = []
    const selectors: Selector[] = []
    getSelectors(tokenizer, selectors, seenImports)

    const names: { [local: string]: string } = {}
    extractNames(selectors, seenImports, fileName, names)

    scopeNames(names, options, fileName)
    conventionaliseLocals(names, options, fileName)
    return names
}
