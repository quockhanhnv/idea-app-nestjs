import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from 'src/user/user.decorator';
import { IdeaDTO } from './idea.dto';
import { IdeaService } from './idea.service';

@Controller('ideas')
export class IdeaController {

    constructor(private readonly ideaService: IdeaService){}

    @Get()
    showAllIdeas() {
        return this.ideaService.showAll();
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
    @UsePipes(new ValidationPipe())
    updateIdea(@Param('id') id: string, @Body() data: Partial<IdeaDTO>) {
        return this.ideaService.update(id, data);
    }

    @Delete(':id')
    destroyIdea(@Param('id') id: string) {
        return this.ideaService.destroy(id);
    }
}
