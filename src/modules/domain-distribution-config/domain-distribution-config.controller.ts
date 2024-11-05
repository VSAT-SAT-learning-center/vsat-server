import { Body, Controller, HttpException, HttpStatus, Patch } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UpdateDomainDistributionConfigDto } from './dto/update-domaindistribution-config.dto';
import { DomainDistributionConfigService } from './domain-distribution-config.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';

@ApiTags('DomainDistributionConfig')
@Controller('domain-distribution-config')
export class DomainDistributionConfigController {
    constructor(
        private readonly domainDistributionConfigService: DomainDistributionConfigService,
    ) {}

    @Patch()
    @ApiBody({ type: [UpdateDomainDistributionConfigDto] })
    async update(@Body() UpdateDomainDistributionConfigDto: UpdateDomainDistributionConfigDto[]) {
        try {
            const createdDomainDistributionConfigs =
                await this.domainDistributionConfigService.updateDomainDistributionConfig(
                    UpdateDomainDistributionConfigDto,
                );
            return ResponseHelper.success(
                HttpStatus.OK,
                createdDomainDistributionConfigs,
                SuccessMessages.update('DomainDistributionConfig'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }
}
