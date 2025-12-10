import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    UnauthorizedException,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { CreateListItemDto } from './dto/create-list-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class ListsController {
    constructor(private readonly listsService: ListsService) { }

    private getUserId(user: any): string {
        const userId = user?.userId ?? user?.id ?? user?.sub;
        if (!userId) {
            throw new UnauthorizedException('Missing user id in token payload');
        }
        return userId;
    }

    // POST /households/:householdId/lists
    @Post('households/:householdId/lists')
    async createList(
        @Param('householdId') householdId: string,
        @CurrentUser() user: any,
        @Body() dto: CreateListDto,
    ) {
        const userId = this.getUserId(user);
        return this.listsService.createList(householdId, userId, dto);
    }

    // GET /households/:householdId/lists
    @Get('households/:householdId/lists')
    async getLists(
        @Param('householdId') householdId: string,
        @CurrentUser() user: any,
    ) {
        const userId = this.getUserId(user);
        return this.listsService.getLists(householdId, userId);
    }

    // GET /lists/:listId
    @Get('lists/:listId')
    async getList(
        @Param('listId') listId: string,
        @CurrentUser() user: any,
    ) {
        const userId = this.getUserId(user);
        return this.listsService.getListById(listId, userId);
    }

    // POST /lists/:listId/items
    @Post('lists/:listId/items')
    async addItem(
        @Param('listId') listId: string,
        @CurrentUser() user: any,
        @Body() dto: CreateListItemDto,
    ) {
        const userId = this.getUserId(user);
        return this.listsService.addItem(listId, userId, dto);
    }

    // GET /lists/:listId/items
    @Get('lists/:listId/items')
    async getItems(
        @Param('listId') listId: string,
        @CurrentUser() user: any,
    ) {
        const userId = this.getUserId(user);
        return this.listsService.getListItems(listId, userId);
    }

    // POST /lists/:listId/items/:itemId/check
    @Post('lists/:listId/items/:itemId/check')
    async checkItem(
        @Param('itemId') itemId: string,
        @CurrentUser() user: any,
    ) {
        const userId = this.getUserId(user);
        return this.listsService.toggleItemChecked(itemId, userId, true);
    }

    // POST /lists/:listId/items/:itemId/uncheck
    @Post('lists/:listId/items/:itemId/uncheck')
    async uncheckItem(
        @Param('itemId') itemId: string,
        @CurrentUser() user: any,
    ) {
        const userId = this.getUserId(user);
        return this.listsService.toggleItemChecked(itemId, userId, false);
    }

    // DELETE /lists/:listId/items/:itemId
    @Post('lists/:listId/items/:itemId/delete')
    async deleteItem(
        @Param('itemId') itemId: string,
        @CurrentUser() user: any,
    ) {
        const userId = this.getUserId(user);
        return this.listsService.deleteItem(itemId, userId);
    }
}
