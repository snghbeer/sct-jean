const fs = require("fs");
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const bucketName = process.env.google_storage_bucket
const folderPath = "uploads/resized/";

class FileManager {
  #storageClient;

  constructor() {
    let config = JSON.parse(process.env.gcp_config)
    //console.log(config)
    this.#storageClient = new Storage({
      credentials: config,
    });
  }

  clearFolder() {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error(err);
        return;
      }

      for (const file of files) {
        fs.unlink(path.join(folderPath, file), (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log(`Deleted file: ${file}`);
        });
      }
    });
  }

  getTotalFiles() {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error(err);
      }
      const fileCount = files.length;
      if (fileCount >= 10) this.clearFolder();
      console.log(`The folder ${folderPath} contains ${fileCount} files.`);
    });
  }

  async uploadImageToCloud(filePath) {
    try {
      await this.#storageClient.bucket(bucketName).upload(filePath);
      console.log(`${filePath} uploaded to ${bucketName}.`);
    } catch (err) {
      console.log(err);
    } finally {
        this.getTotalFiles()
    }
  }

  async deleteImgInCloud(fileName) {
    try {
      const bucket = this.#storageClient.bucket(bucketName);
      const file = bucket.file(fileName);
      await file.delete();
      return true
    } catch (err) {
      console.error(err);
      return false
    }
  }
}

module.exports = {
  FileManager: FileManager,
};
