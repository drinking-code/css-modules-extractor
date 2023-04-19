export declare function getNames(fileName: string, options: Options): void;

declare interface Options {
    localsConvention?:
        | "camelCase"
        | "camelCaseOnly"
        | "dashes"
        | "dashesOnly"
        | LocalsConventionFunction;

    scopeBehaviour?: "global" | "local";
    globalModulePaths?: RegExp[];

    generateScopedName?: string | GenerateScopedNameFunction;

    hashPrefix?: string;
    exportGlobals?: boolean;
    root?: string;

    Loader?: typeof Loader;

    resolve?: (file: string, importer: string) => string | null | Promise<string | null>;
}

declare type LocalsConventionFunction = (
    originalClassName: string,
    generatedClassName: string,
    inputFile: string
) => string;

declare type GenerateScopedNameFunction = (name: string, filename: string, css: string) => string;

declare class Loader {
    constructor(root: string, plugins: Plugin[]);

    fetch(file: string, relativeTo: string, depTrace: string): Promise<{ [key: string]: string }>;

    finalSource?: string | undefined;
}
