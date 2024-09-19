import { Controller, Get } from '@nestjs/common';

@Controller('account')
export class AccountController {

    @Get()
    async Test(){
        return 'This is account module';
    }
}
