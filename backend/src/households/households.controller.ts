import { Controller, Get, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { HouseholdsService } from './households.service';
import { CreateHouseholdDto } from './dto/create-household.dto';

@Controller('households')
export class HouseholdsController {
    constructor(private readonly householdsService: HouseholdsService) { }

    private getUserIdFromHeader(userIdHheader: string): string {
        if (!userIdHheader) {
            throw new UnauthorizedException('Missing x-user-id header');
        }
        return userIdHheader;
    }

    @Post()
    async create(
        @Body() createHouseholdDto: CreateHouseholdDto,
        @Headers('x-user-id') userIdHeader: string,
    ) {
        const userId = this.getUserIdFromHeader(userIdHeader);
        return this.householdsService.createHousehold(userId, createHouseholdDto);
    }

    @Get('me')
    async list(@Headers('x-user-id') userIdHeader: string) {
        const userId = this.getUserIdFromHeader(userIdHeader);
        return this.householdsService.listHouseholds(userId);
    }
}
