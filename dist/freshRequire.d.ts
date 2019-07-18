/// <reference types="node" />
/**
 * Bypass the require cache when requiring a module
 *
 * @param file The name or path of the module
 * @param requireFn Optional require function
 */
export declare function freshRequire(file: string, requireFn?: NodeRequire): any;
