"use strict";
// https://github.com/hughsk/fresh-require
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Bypass the require cache when requiring a module
 *
 * @param file The name or path of the module
 * @param requireFn Optional require function
 */
function freshRequire(file, requireFn = require) {
    const resolvedFile = requireFn.resolve(file);
    const temp = requireFn.cache[resolvedFile];
    delete requireFn.cache[resolvedFile];
    const modified = requireFn(resolvedFile);
    requireFn.cache[resolvedFile] = temp;
    return modified;
}
exports.freshRequire = freshRequire;
//# sourceMappingURL=freshRequire.js.map