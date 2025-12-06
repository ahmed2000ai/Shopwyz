import {
  Controller,
  Get,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { OffersService } from './offers.service';

@Controller('lists')
export class RecommendationController {
  constructor(private readonly offersService: OffersService) { }

  private getUserIdFromHeader(userIdHeader?: string): string {
    if (!userIdHeader) {
      throw new UnauthorizedException('Missing x-user-id header');
    }
    return userIdHeader;
  }

  // GET /lists/:id/recommendation
  @Get(':id/recommendation')
  async getRecommendation(
    @Param('id') listId: string,
    @Headers('x-user-id') userIdHeader: string,
  ) {
    const userId = this.getUserIdFromHeader(userIdHeader);
    // Adjust method name if your service uses a different one
    return this.offersService.getBestSupermarketForList(listId, userId);
  }
}
