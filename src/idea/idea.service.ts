import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { throws } from 'assert';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { IdeaDTO } from './idea.dto';
import { IdeaEntity } from './idea.entity';

@Injectable()
export class IdeaService {
    constructor(
        @InjectRepository(IdeaEntity) private ideaRepository: Repository<IdeaEntity>,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
    ) {}

    async showAll() {
        return await this.ideaRepository.find({ relations: ['author']});
    }

    async create(userId: string, data: IdeaDTO) {
        console.log('userId', userId);
        
        // const user = await this.userRepository.findOne({ where: { id: userId } });
        const user = await this.userRepository.findOne({ where: { id: 4 } });
       
        const idea = await this.ideaRepository.create({...data, author: user});
        await this.ideaRepository.save(idea);
        return {...idea, author: idea.author.toResponseObject() };
    }

    async read(id: string) {
        const idea = await this.ideaRepository.findOne({ where: { id }})
        if(!idea) {
            throw new HttpException('Not found idea', HttpStatus.NOT_FOUND);
        }

        return idea;
    }

    async update(id: string, data: Partial<IdeaDTO>) {
        const idea = await this.ideaRepository.findOne({ where: { id }});
        if(!idea) {
            throw new HttpException('Not found idea', HttpStatus.NOT_FOUND);
        }

        await this.ideaRepository.update({id}, data);
        return idea;
    }

    async destroy(id: string) {
        const idea = await this.ideaRepository.findOne({ where: { id }});
        if(!idea) {
            throw new HttpException('Not found idea', HttpStatus.NOT_FOUND);
        }

        await this.ideaRepository.delete({ id });
        return idea;
    }
}
