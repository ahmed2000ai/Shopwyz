import { Controller, Post, Body } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Controller()
export class OffersController {
    constructor(private readonly offersService: OffersService) { }

    // POST /offers
    @Post('offers')
    create(@Body() dto: CreateOfferDto) {
        return this.offersService.create(dto);
    }
}
