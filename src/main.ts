import path from 'path';
import { Module } from './module.js';
import { fileURLToPath } from 'url';

const dirName = fileURLToPath(new URL('.', import.meta.url));
const entryPath = path.resolve(dirName, '../sample/input/index.js');
const outputPath = path.resolve(dirName, '../sample/output/bundle.js');
new Module(entryPath).packToBundle(outputPath).catch(console.error);
console.debug(Module.moduleMap);
