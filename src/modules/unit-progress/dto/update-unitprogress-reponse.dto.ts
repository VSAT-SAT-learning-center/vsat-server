import { ProgressStatus } from "src/common/enums/progress-status.enum";
import { Level } from "src/database/entities/level.entity";

export class UnitProgressResponseDto {
    id: string;
    progress: number;
    status: ProgressStatus;
    unit: {
        id: string;
        title: string;
        description: string;
        level: Level;
    };
}
