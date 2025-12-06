import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSupermarketDto } from './dto/create-supermarket.dto';

@Injectable()
export class SupermarketsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateSupermarketDto) {
        return this.prisma.supermarket.create({
            data: dto,
        });
    }

    async findAll(city?: string) {
        return this.prisma.supermarket.findMany({
            where: city ? { city: { equals: city, mode: 'insensitive' } } : {},
        });
    }
}
