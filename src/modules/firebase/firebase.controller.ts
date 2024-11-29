import { Controller, Post, Delete, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseStorageService } from './firebase.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('storage')
@ApiTags('Firebase Storage')
export class FirebaseStorageController {
    constructor(private readonly firebaseStorageService: FirebaseStorageService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('folder') folder: string = 'uploads',
    ) {
        const fileUrl = await this.firebaseStorageService.uploadFile(file, folder);
        return { fileUrl };
    }

    @Delete('delete')
    async deleteFile(@Body('filePath') filePath: string) {
        await this.firebaseStorageService.deleteFile(filePath);
        return { message: 'File deleted successfully' };
    }
}
