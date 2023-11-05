import { type ParseResult, parse } from '@babel/parser';
import { readFileSync } from 'fs';
import path from 'path';
import { type ImportDeclaration, type File } from '@babel/types';

/**
 * 模块依赖图节点
 * @property {string} path 模块路径
 * @property {ParseResult<File>} ast 模块AST
 * @property {Map<string, Module>} moduleMap 缓存，键为 modulePath，值为依赖图节点
 * @property {Module[]} dependencies 模块依赖
 */
export class Module {
  path: string;
  content: string = '';
  ast: ParseResult<File> = {} as any;
  dependencies: Module[] = [];
  static moduleMap: Map<string, Module> = new Map<string, Module>();

  constructor (path: string) {
    this.path = path;
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
      .map(node => node.source.value)
      .map((source) => Module.resolvePath(this.path, source))
      .map((path) => new Module(path));
  }

  /**
   * 原始依赖路径得出模块绝对路径，原始路径可能是相对地址，绝对地址，node_modules 引用
   * 这里是简化做法 只考虑相对路径
   * @param currentModulePath 当前模块的路径
   * @param importModuleSource 导入的模块路径
   * @returns {string} 模块绝对路径
   */
  static resolvePath (currentModulePath: string, importModuleSource: string) {
    return path.resolve(path.dirname(currentModulePath), importModuleSource);
  }
}
