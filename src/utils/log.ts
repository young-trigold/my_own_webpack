import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

/**
 * 打日志
 * @param content 日志内容
 * @param fileName 日志文件名
 */
export const log = async (filePath: string, content: string) => {
  const dirName = path.dirname(filePath);
  if (!existsSync(dirName)) mkdirSync(dirName, { recursive: true });
  await writeFile(filePath, content);
};
