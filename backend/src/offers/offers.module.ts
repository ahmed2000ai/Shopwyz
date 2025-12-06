import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { RecommendationController } from './recommendation.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [OffersController, RecommendationController],
    providers: [OffersService],
})
export class OffersModule { }
