import { Injectable } from '@nestjs/common';
import { firebaseApp } from './firebase';
import { v4 as uuidv4 } from 'uuid';
import { Multer } from 'multer';

@Injectable()
export class FirebaseStorageService {
    private bucket = firebaseApp.storage().bucket();

    async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
        const fileName = `vsat/${folder}/${uuidv4()}-${file.originalname}`;
        const fileRef = this.bucket.file(fileName);

        // Save the file to Firebase Storage
        await fileRef.save(file.buffer, {
            contentType: file.mimetype, // Set the correct content type
        });

        // Make the file publicly accessible
        await fileRef.makePublic();

        // Return the public URL
        return fileRef.publicUrl();
    }

    async uploadFiles(files: Express.Multer.File[], folder: string): Promise<string[]> {
        const urls = [];
        for (const file of files) {
            const url = await this.uploadFile(file, folder);
            urls.push(url);
        }
        return urls;
    }

    async deleteFile(filePath: string): Promise<void> {
        const fileRef = this.bucket.file(filePath);

        try {
            await fileRef.delete();
        } catch (error) {
            throw new Error(`Failed to delete file at ${filePath}: ${error.message}`);
        }
    }
}
