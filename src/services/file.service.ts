import { File, Folder, knownFolders, path } from '@nativescript/core';
import { Http } from '@nativescript/core';

export class FileService {
  private static documentsFolder = knownFolders.documents();

  static async downloadFile(url: string, fileName: string): Promise<string> {
    try {
      const response = await Http.getFile(url);
      const documentsPath = path.join(this.documentsFolder.path, fileName);

      // 保存文件
      const file = File.fromPath(documentsPath);
      await file.writeSync(response);

      console.log('文件下载成功:', documentsPath);
      return documentsPath;
    } catch (error) {
      console.error('文件下载失败:', error);
      throw error;
    }
  }

  static async readFile(filePath: string): Promise<string> {
    try {
      const file = File.fromPath(filePath);
      const content = await file.readText();
      return content;
    } catch (error) {
      console.error('文件读取失败:', error);
      throw error;
    }
  }

  static async writeFile(filePath: string, content: string): Promise<void> {
    try {
      const file = File.fromPath(filePath);
      await file.writeText(content);
      console.log('文件写入成功:', filePath);
    } catch (error) {
      console.error('文件写入失败:', error);
      throw error;
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      const file = File.fromPath(filePath);
      await file.remove();
      console.log('文件删除成功:', filePath);
    } catch (error) {
      console.error('文件删除失败:', error);
      throw error;
    }
  }

  static async createFolder(folderPath: string): Promise<Folder> {
    try {
      const folder = Folder.fromPath(folderPath);
      return folder;
    } catch (error) {
      console.error('文件夹创建失败:', error);
      throw error;
    }
  }

  static getDocumentsPath(): string {
    return this.documentsFolder.path;
  }
}