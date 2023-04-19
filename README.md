# Extract names from SCSS modules

Package for fast extraction of module names from SCSS files.

Typically, you would do something like this:

```javascript
const sassResult = sass.compile(fileName)
let cssModulesJson
const cssModulesPlugin = require('postcss-modules')({
    getJSON: (cssFileName, json) => cssModulesJson = json
})
await postcss([cssModulesPlugin])
    .process(sassResult.css, {from: fileName, to: undefined})
```

Basically transpiling the whole file.  
But if you only want the module names (without transpiling the file), you can use this package:

```javascript
const cssModulesJson = getNames(fileName)
```

This is about **20 times faster** than compiling the SCSS and extracting the names with `postcss-modules`.

## Options

This package accepts the same options as [`postcss-modules`](https://github.com/madyankin/postcss-modules), though not
all options are implemented, yet.

| Option               | Implemented |
|----------------------|-------------|
| `getJSON`            | –           |
| `localsConvention`   | ✓           |
| `scopeBehaviour`     | ×           |
| `globalModulePaths`  | ×           |
| `generateScopedName` | ✓           |
| `hashPrefix`         | ✓           |
| `exportGlobals`      | ×           |
| `root`               | ×           |
| `Loader`             | ×           |
| `resolve`            | ×           |
