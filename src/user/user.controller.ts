import { Body, Controller, Get, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from './user.decorator';
import { UserDTO } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    
    constructor(private readonly userService: UserService){}

    // @Get('')
    // @UseGuards(new AuthGuard())
    // showAllUsers(@User() user) { // ???? decorator    
    //     return this.userService.showAll();
    // }

    @Get('')
    showAllUsers(@Query('page') page: number) { 
        return this.userService.showAll(page);
    }

    @Post('login')
    @UsePipes(new ValidationPipe())
    login(@Body() data: UserDTO) {
        return this.userService.login(data);
    }

    @Post('register')
    @UsePipes(new ValidationPipe())
    register(@Body() data: UserDTO) {
        return this.userService.register(data);
    }
}
