import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Headers,
    UnauthorizedException,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { CreateListItemDto } from './dto/create-list-item.dto';

@Controller()
export class ListsController {
    constructor(private readonly listsService: ListsService) { }

    private getUserIdFromHeader(userIdHeader?: string): string {
        if (!userIdHeader) {
            throw new UnauthorizedException('Missing x-user-id header');
        }
        return userIdHeader;
    }

    // POST /households/:householdId/lists
    @Post('households/:householdId/lists')
    async createList(
        @Param('householdId') householdId: string,
        @Headers('x-user-id') userIdHeader: string,
        @Body() dto: CreateListDto,
    ) {
        const userId = this.getUserIdFromHeader(userIdHeader);
        return this.listsService.createList(householdId, userId, dto);
    }

    // GET /households/:householdId/lists
    @Get('households/:householdId/lists')
    async getLists(
        @Param('householdId') householdId: string,
        @Headers('x-user-id') userIdHeader: string,
    ) {
        const userId = this.getUserIdFromHeader(userIdHeader);
        return this.listsService.getLists(householdId, userId);
    }

    // POST /lists/:listId/items
    @Post('lists/:listId/items')
    async addItem(
        @Param('listId') listId: string,
        @Headers('x-user-id') userIdHeader: string,
        @Body() dto: CreateListItemDto,
    ) {
        const userId = this.getUserIdFromHeader(userIdHeader);
        return this.listsService.addItem(listId, userId, dto);
    }

    // GET /lists/:listId/items
    @Get('lists/:listId/items')
    async getItems(
        @Param('listId') listId: string,
        @Headers('x-user-id') userIdHeader: string,
    ) {
        const userId = this.getUserIdFromHeader(userIdHeader);
        return this.listsService.getListItems(listId, userId);
    }
}