import path from 'path';
import { Module } from './module.js';
import { stringify } from './utils/stringify.js';
import { log } from './utils/log.js';
import { fileURLToPath } from 'url';

export const dirName = fileURLToPath(new URL('.', import.meta.url));
const entryPath = path.resolve(dirName, '../sample/input/index.js');
const moduleGraph = new Module(entryPath);
log(path.resolve(dirName, '../sample/log/dependency_graph.json'), stringify(moduleGraph)).catch(console.error);
const moduleMap = Module.moduleMap;
console.debug(moduleMap);

// const packModulesToBundle = () => {
//   const require = moduleName => {
//     // if in moduleMap, return the moduleMapd version
//     if (modulemoduleMap[moduleName]) {
//       return modulemoduleMap[moduleName];
//     }
//     const exports = {};
//     // this will prevent infinite "require" loop
//     // from circular dependencies
//     modulemoduleMap[moduleName] = exports;

//     // "require"-ing the module,
//     // exported stuff will assigned to "exports"
//     modules[moduleName](exports, require);
//     return modulemoduleMap[moduleName];
//   };

//   // start the program
//   require(entry);
// };
