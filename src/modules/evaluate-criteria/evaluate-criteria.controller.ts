import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { EvaluateCriteriaService } from './evaluate-criteria.service';
import { EvaluateCriteriaResponseDto } from './dto/evaluate-criteria.dto';

@ApiTags('Evaluate Criteria')
@Controller('evaluate-criteria')
export class EvaluateCriteriaController {
    constructor(private readonly evaluateCriteriaService: EvaluateCriteriaService) {}

    @Get()
    @ApiOperation({ summary: 'Get all evaluate criteria' })
    @ApiResponse({
        status: 200,
        description: 'List of all evaluate criteria',
        type: [EvaluateCriteriaResponseDto],
    })
    async getAllEvaluateCriteriaBase(): Promise<EvaluateCriteriaResponseDto[]> {
        return await this.evaluateCriteriaService.getAllEvaluateCriteria(null);
    }

    @Get(':evaluateApplicateTo')
    @ApiOperation({ summary: 'Get evaluate criteria by applicableTo' })
    @ApiResponse({
        status: 200,
        description: 'List of evaluate criteria for a specific role',
        type: [EvaluateCriteriaResponseDto],
    })
    async getAllEvaluateCriteria(
        @Param('evaluateApplicateTo') evaluateApplicateTo: string,
    ): Promise<EvaluateCriteriaResponseDto[]> {
        return await this.evaluateCriteriaService.getAllEvaluateCriteria(
            evaluateApplicateTo,
        );
    }

    @Get('details/:id')
    @ApiOperation({ summary: 'Get evaluate criteria by ID' })
    @ApiResponse({
        status: 200,
        description: 'Evaluate criteria details',
        type: EvaluateCriteriaResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Evaluate criteria not found' })
    async getEvaluateCriteriaById(
        @Param('id') id: string,
    ): Promise<EvaluateCriteriaResponseDto> {
        return await this.evaluateCriteriaService.getEvaluateCriteriaById(id);
    }
}
