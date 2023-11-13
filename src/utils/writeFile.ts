import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { writeFile as originWriteFile } from 'fs/promises';

export const writeFile = async (filePath: string, content: string) => {
  const dirName = path.dirname(filePath);
  if (!existsSync(dirName)) mkdirSync(dirName, { recursive: true });
  await originWriteFile(filePath, content);
};
