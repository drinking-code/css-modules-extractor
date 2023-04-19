import { type GenerateScopedNameFunction } from './post/scoped-name.js';
import { type LocalsConventionFunction } from './post/locals-convention.js';
export interface Options {
    localsConvention?: "camelCase" | "camelCaseOnly" | "dashes" | "dashesOnly" | LocalsConventionFunction;
    generateScopedName?: string | GenerateScopedNameFunction;
    hashPrefix?: string;
}
export default function getNames(fileName: string, options?: Options): {
    [local: string]: string;
};
