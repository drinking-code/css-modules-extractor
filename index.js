export {getNames} from './dist/index.js'

import {getNames} from './dist/index.js'

const perfStart = performance.now()
console.log(getNames('./styles/pages/access.scss'))
const perfEnd = performance.now()
console.log(`Took ${Math.round((perfEnd - perfStart) * 1e2) / 1e2} ms`)
