import { Module } from '@nestjs/common';
import { FirebaseStorageService } from './firebase.service';
import { FirebaseStorageController } from './firebase.controller';

@Module({
    providers: [FirebaseStorageService],
    controllers: [FirebaseStorageController],
    exports: [FirebaseStorageService],
})
export class FirebaseModule {}
