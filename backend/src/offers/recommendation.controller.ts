import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('lists')
@UseGuards(JwtAuthGuard)
export class RecommendationController {
  constructor(private readonly offersService: OffersService) { }

  // GET /lists/:id/recommendation
  @Get(':id/recommendation')
  async getRecommendation(
    @Param('id') listId: string,
    @CurrentUser() user: any,
  ) {
    return this.offersService.getBestSupermarketForList(listId, user.id);
  }
}
