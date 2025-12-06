import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SupermarketsService } from './supermarkets.service';
import { CreateSupermarketDto } from './dto/create-supermarket.dto';

@Controller('supermarkets')
export class SupermarketsController {
    constructor(private readonly supermarketsService: SupermarketsService) { }

    @Post()
    create(@Body() createSupermarketDto: CreateSupermarketDto) {
        return this.supermarketsService.create(createSupermarketDto);
    }

    @Get()
    findAll(@Query('city') city?: string) {
        return this.supermarketsService.findAll(city);
    }
}
