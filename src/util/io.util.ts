import { dirname } from 'path';
import { readFile, exists, writeFile, mkdir } from 'mz/fs';

export default class IO {

    public static async readAsString(filePath: string): Promise<string> {
        const fileContent = await readFile(filePath);
        return fileContent.toString();
    }

    public static async writeAndMkdir(filePath: string, content: string): Promise<void> {
        const dir = dirname(filePath);

        // If the directory is missing, create it
        if (!(await exists(dir))) {
            await mkdir(dir);
        }

        // Write the rendered html file
        await writeFile(filePath, content);
    }

}
