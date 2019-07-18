// https://github.com/hughsk/fresh-require

/**
 * Bypass the require cache when requiring a module
 *
 * @param file The name or path of the module
 * @param requireFn Optional require function
 */
export function freshRequire(file: string, requireFn: NodeRequire = require): any {

	const resolvedFile = requireFn.resolve(file);
	const temp = requireFn.cache[resolvedFile];
	delete requireFn.cache[resolvedFile];
	const modified = requireFn(resolvedFile);
	requireFn.cache[resolvedFile] = temp;
	return modified;
}
