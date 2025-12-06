import { Controller, Post, Get, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Controller()
export class OffersController {
    constructor(private readonly offersService: OffersService) { }

    private getUserIdFromHeader(userIdHeader: string): string {
        if (!userIdHeader) {
            throw new UnauthorizedException('Missing x-user-id header');
        }
        return userIdHeader;
    }

    // POST /offers
    @Post('offers')
    create(@Body() dto: CreateOfferDto) {
        return this.offersService.create(dto);
    }

    // GET /lists/:listId/recommendation
    @Get('lists/:listId/recommendation')
    getRecommendation(
        @Param('listId') listId: string,
        @Headers('x-user-id') userIdHeader: string,
    ) {
        const userId = this.getUserIdFromHeader(userIdHeader);
        return this.offersService.getRecommendation(listId, userId);
    }
}
