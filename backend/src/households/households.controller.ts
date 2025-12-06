import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { HouseholdsService } from './households.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('households')
@UseGuards(JwtAuthGuard)
export class HouseholdsController {
    constructor(private readonly householdsService: HouseholdsService) { }

    @Post()
    async create(
        @Body() createHouseholdDto: CreateHouseholdDto,
        @CurrentUser() user: any,
    ) {
        return this.householdsService.createHousehold(user.id, createHouseholdDto);
    }

    @Get('me')
    async list(@CurrentUser() user: any) {
        return this.householdsService.listHouseholds(user.id);
    }
}
