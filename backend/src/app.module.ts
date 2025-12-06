import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { HouseholdsModule } from './households/households.module';
import { AuthModule } from './auth/auth.module';
import { ListsModule } from './lists/lists.module';
import { AiModule } from './ai/ai.module';
import { OffersModule } from './offers/offers.module';
import { ProductsModule } from './products/products.module';
import { SupermarketsModule } from './supermarkets/supermarkets.module';

@Module({
  imports: [PrismaModule, HouseholdsModule, AuthModule, ListsModule, AiModule, OffersModule, ProductsModule, SupermarketsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
