import { Controller } from "@nestjs/common";
import { ExamStructureConfigService } from "./exam-structure-config.service";



@Controller()
export class ExamStructureConfigController{
    constructor(
        private readonly examStructureConfigService : ExamStructureConfigService
    ){}

    
}