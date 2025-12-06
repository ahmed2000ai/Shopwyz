import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { AiService } from './ai.service';
import { ParseTextDto } from './dto/parse-text.dto';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    private getUserIdFromHeader(userIdHeader: string): string {
        if (!userIdHeader) {
            throw new UnauthorizedException('Missing x-user-id header');
        }
        return userIdHeader;
    }

    @Post('parse-text')
    async parseText(
        @Body() dto: ParseTextDto,
        @Headers('x-user-id') userIdHeader: string,
    ) {
        const userId = this.getUserIdFromHeader(userIdHeader);
        return this.aiService.parseAndAddItems(userId, dto);
    }
}
