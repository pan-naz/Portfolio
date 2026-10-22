import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Use the interaction tests' transpilation pattern; resolve browser imports for Node.
const file = new URL('../../src/scripts/work-filter/work-filter.ts', import.meta.url);
const source = readFileSync(file, 'utf8').replace(/from '(\.[^']+)'/g, (_, path) =>
  `from '${new URL(path.endsWith('.ts') ? path : `${path}.ts`, file).href}'`);
const runtime = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
export const { initialWorkFilter, matchesWorkFilter, workFilterHash, initializeWorkFilter } =
  await import(`data:text/javascript;base64,${Buffer.from(runtime).toString('base64')}`);
