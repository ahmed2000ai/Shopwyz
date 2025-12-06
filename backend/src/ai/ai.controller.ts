import { Controller, Post, Body, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AiService } from './ai.service';
import { ParseTextDto } from './dto/parse-text.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(private readonly aiService: AiService) { }

    private getUserId(user: any): string {
        const userId = user?.userId ?? user?.id ?? user?.sub;
        if (!userId) {
            throw new UnauthorizedException('Missing user id in token payload');
        }
        return userId;
    }

    @Post('parse-text')
    async parseText(
        @Body() dto: ParseTextDto,
        @CurrentUser() user: any,
    ) {
        const userId = this.getUserId(user);
        return this.aiService.parseAndAddItems(userId, dto);
    }
}