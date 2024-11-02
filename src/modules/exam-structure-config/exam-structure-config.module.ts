import { Module } from "@nestjs/common";
import { ExamStructureController } from "../exam-structure/exam-structure.controller";
import { ExamStructureConfig } from "src/database/entities/examstructureconfig.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExamStructureConfigService } from "./exam-structure-config.service";
import { ExamStructureConfigController } from "./exam-structure-config.controller";
import { ExamStructure } from "src/database/entities/examstructure.entity";
import { Domain } from "domain";



@Module({
    imports: [TypeOrmModule.forFeature([ExamStructureConfig, ExamStructure, Domain])],
    controllers: [ExamStructureConfigController],
    providers: [ExamStructureConfigService],
    exports: [ExamStructureConfigService]
})
export class ExamStructureConfigModule{}