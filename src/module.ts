import { type ParseResult, parse } from '@babel/parser';
import { readFileSync } from 'fs';
import path from 'path';
import {
  type ImportDeclaration,
  type File,
  expressionStatement,
  arrowFunctionExpression,
  blockStatement,
  returnStatement,
  objectExpression,
  classExpression,
  functionExpression,
  type Expression,
} from '@babel/types';
import traverse from '@babel/traverse';
import generator from '@babel/generator';
import {
  callExpression,
  identifier,
  objectPattern,
  objectProperty,
  stringLiteral,
  variableDeclaration,
  variableDeclarator
} from '@babel/types';
import { writeFile } from './utils/writeFile.js';
import { stringify } from './utils/stringify.js';
import { fileURLToPath } from 'url';

const dirName = fileURLToPath(new URL('.', import.meta.url));

/**
 * 模块类型
 * @class Module
 * @property {string} path 模块路径
 * @property {ParseResult<File>} ast 模块AST
 * @property {Map<string, Module>} moduleMap 缓存，键为 modulePath，值为依赖图节点
 * @property {Module[]} dependencies 模块依赖
 */
export class Module {
  path: string;
  content = '';
  ast: ParseResult<File> = {} as any;
  dependencies: Module[] = [];
  static moduleMap = new Map<string, Module>();

  constructor (path: string) {
    // escape slash
    this.path = path.replace(/[\\$'"]/g, '\\$&');
    // console.debug(Module.moduleMap);
    if (Module.moduleMap.has(this.path)) return Module.moduleMap.get(this.path)!;
    Module.moduleMap.set(this.path, this);
    this.init();
  }

  init () {
    this.content = readFileSync(this.path).toString('utf-8');
    this.ast = parse(this.content, { sourceType: 'module' });
    // 导入声明语句节点含有 source 节点属性，表示导入的模块路径
    // https://github.com/estree/estree/blob/master/es2015.md#importdeclaration

    this.dependencies = (this.ast.program.body
      .filter(node => node.type === 'ImportDeclaration') as ImportDeclaration[])
      .map((node) => Module.resolvePath(this.path, node.source.value))
      .map((path) => new Module(path));
  }

  /**
   * - 将ESM转换为CMD
   * - 将导入路径转为模块id（这里是绝对 path）
   */
  transform () {
    traverse.default(this.ast, {
      Program (nodePath) {
        const body = nodePath.node.body;
        const moduleFunc = [
          expressionStatement(
            arrowFunctionExpression([],
              blockStatement(body)))];
        nodePath.node.body = moduleFunc;
      },
      ImportDeclaration: (nodePath) => {
        // import a, {b as _b, c} from 'test.js';
        // const importModule  = () => {};
        // const {default: _a, _b: b, c: _c} = importModule('test.js');
        // import 'test.js';
        // const {} = importModule('test.js');
        if (!nodePath.isImportDeclaration()) return;
        const specifiers = nodePath.get('specifiers').map(specifier => {
          const getImported = () => {
            if (specifier.isImportDefaultSpecifier()) return identifier('default');
            if (specifier.isImportNamespaceSpecifier()) return identifier('namespace');
            if (specifier.isImportSpecifier()) return specifier.get('imported').node;
          };
          return { local: specifier.get('local').node, imported: getImported() };
        });
        // console.debug(specifiers);
        const importVariableDeclaration = variableDeclaration('const', [
          variableDeclarator(
            objectPattern(specifiers.map(specifier => objectProperty(specifier.imported!, specifier.local))),
            callExpression(identifier('importModule'), [stringLiteral(Module.resolvePath(this.path, nodePath.get('source').node.value))])
          ),
        ]);
        nodePath.replaceWith(importVariableDeclaration);
      },
      ExportDefaultDeclaration (nodePath) {
        // const a = '';
        // export default a;
        // return {default: a}

        if (!nodePath.isExportDefaultDeclaration()) return;
        const declaration = nodePath.get('declaration');
        const getValue = () => {
          if (declaration.isExpression()) return declaration.node;
          if (declaration.isClassDeclaration()) {
            return classExpression(declaration.node.id, declaration.node.superClass, declaration.node.body);
          }
          if (declaration.isFunctionDeclaration()) {
            return functionExpression(declaration.node.id, declaration.node.params, declaration.node.body);
          }
          return declaration.node as Expression;
        };
        // const re = expressionStatement(assignmentExpression('=', memberExpression(identifier('exports'), identifier('default')), getValue()))
        const returns = returnStatement(objectExpression([objectProperty(identifier('default'), getValue())]));
        nodePath.replaceWith(returns);
      },
      ExportNamedDeclaration (nodePath) {
        // const b = '';
        // export {b as _b};
        // exports.default = b;
        if (!nodePath.isExportNamedDeclaration()) return;
        const specifiers = nodePath.get('specifiers').map(specifier => {
          if (specifier.isExportDefaultSpecifier()) {
            return {
              local: specifier.get('local'),
              exported: specifier.get('exported'),
            };
          }
          if (specifier.isExportNamespaceSpecifier()) {
            return {
              local: specifier.get('local'),
              exported: specifier.get('exported'),
            };
          }
          return {
            local: specifier.get('local').node,
            exported: specifier.get('exported').node,
          };
        });
        // const res = specifiers.map(specifier => expressionStatement(assignmentExpression('=', memberExpression(identifier('exports'), specifier.exported), specifier.local)));
        const returnSt = returnStatement(
          objectExpression(
            specifiers.map(specifier => objectProperty(specifier.exported, specifier.local))));
        nodePath.replaceWith(returnSt);
      }
    });
    this.content = generator.default(this.ast, {
      jsescOption: {
        quotes: 'single',
        minimal: true,
        // isScriptContext: true
      }
    }).code;
    console.debug(this.content);
    this.dependencies.forEach(module => { module.transform(); });
  }

  /**
   * 原始依赖路径得出模块绝对路径，原始路径可能是相对地址，绝对地址，node_modules 引用
   * @param currentModulePath 当前模块的路径
   * @param importModuleSource 导入的模块路径
   * @returns {string} 模块绝对路径
   */
  static resolvePath (currentModulePath: string, importModuleSource: string): string {
    if (importModuleSource.startsWith('.')) return path.resolve(path.dirname(currentModulePath), importModuleSource);
    return (importModuleSource);
  }

  /**
   * 将模块打包为 bundle
   * @param outputPath 输出路径
   */
  async packToBundle (outputPath: string) {
    // writeFile(path.resolve(dirName, '../sample/log/dependency_graph.json'), stringify(moduleGraph)).catch(console.error);
    // const moduleMap = Module.moduleMap;
    this.transform();
    // [...moduleMap.values()].forEach(module => { module.transform(); });
    writeFile(path.resolve(dirName, '../sample/log/dependency_graph.json'), stringify(this)).catch(console.error);
    const modulesAsStr = `{${[...Module.moduleMap.entries()].map(([path, module]) => `"${path}": ${module.content.slice(0, -1)}`).join(',')}}`;
    // console.debug(modulesAsStr)
    const funcName = 'importModule';
    const bundleContent = `const moduleMap = ${modulesAsStr};
    const ${funcName} = (path) => {
      return moduleMap[path]();
    };
    ${funcName}('${this.path}');`;
    await writeFile(outputPath, bundleContent);
  };
}
