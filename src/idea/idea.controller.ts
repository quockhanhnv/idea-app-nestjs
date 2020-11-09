import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from 'src/user/user.decorator';
import { IdeaDTO } from './idea.dto';
import { IdeaService } from './idea.service';

@Controller('ideas')
export class IdeaController {

    constructor(private readonly ideaService: IdeaService){}

    @Get()
    showAllIdeas(@Query('page') page: number) {
        return this.ideaService.showAll(page);
    }

    @Post()
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    async createIdea(@User('id') user, @Body() data: IdeaDTO) {
        return this.ideaService.create(user, data);
    }

    @Get(':id')
    readIdea(@Param('id') id: string) {
        return this.ideaService.read(id);
    }

    @Put(':id')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    updateIdea(@Param('id') id: string, @User('id') user: string, @Body() data: Partial<IdeaDTO>) {
        return this.ideaService.update(id, user, data);
    }

    @Delete(':id')
    @UseGuards(new AuthGuard())
    destroyIdea(@Param('id') id: string, @User('id') user) {
        return this.ideaService.destroy(id, user);
    }

    @Post(':id/upvote')
    @UseGuards(new AuthGuard)
    upvoteIdea(@Param('id') id: string, @User('id') user: string) {
        return this.ideaService.upvote(id, user);
    }

    @Post(':id/downvote')
    @UseGuards(new AuthGuard)
    downvoteIdea(@Param('id') id: string, @User('id') user: string) {
        return this.ideaService.downvote(id, user);
    }

    @Post(':id/bookmark')
    @UseGuards(new AuthGuard)
    bookmarkIdea(@Param('id') id: string, @User('id') user: string) {
        return this.ideaService.bookmark(id, user);
    }

    @Delete(':id/bookmark')
    @UseGuards(new AuthGuard)
    unbookmarkIdea(@Param('id') id: string, @User('id') user: string) {
        return this.ideaService.unbookmark(id, user);
    }
}
