import { Module } from "@nestjs/common";
import { SectionController } from "./section.controller";
import { SectionService } from "./section.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Section } from "../../database/entities/section.entity"


@Module ({
    imports: [
        TypeOrmModule.forFeature([Section])
    ],
    controllers: [SectionController],
    providers: [SectionService],
    exports: [SectionService],
})

export class SectionModule {}