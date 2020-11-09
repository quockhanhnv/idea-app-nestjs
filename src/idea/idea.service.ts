import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Votes } from 'src/shared/vote.enum';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { IdeaDTO, IdeaRO } from './idea.dto';
import { IdeaEntity } from './idea.entity';

@Injectable()
export class IdeaService {
    constructor(
        @InjectRepository(IdeaEntity) private ideaRepository: Repository<IdeaEntity>,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
    ) {}

    async showAll(): Promise<IdeaRO[]> {
        const ideas =  await this.ideaRepository.find({ relations: ['author', 'upvotes', 'downvotes'] });
        return ideas.map(idea => this.toResponseObject(idea));
    }

    async create(userId: string, data: IdeaDTO): Promise<IdeaRO> {
        const user = await this.userRepository.findOne({ where: { id: 1 } });
       
        const idea = await this.ideaRepository.create({...data, author: user});
        await this.ideaRepository.save(idea);
        return this.toResponseObject(idea);
    }

    async read(id: string): Promise<IdeaRO> {
        const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'upvotes', 'downvotes', 'comments'] })
        if(!idea) {
            throw new HttpException('Not found idea', HttpStatus.NOT_FOUND);
        }

        return this.toResponseObject(idea);
    }

    async update(id: string, userId: string, data: Partial<IdeaDTO>): Promise<IdeaRO> {
        let idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author'] });
        if(!idea) {
            throw new HttpException('Not found idea', HttpStatus.NOT_FOUND);
        }

        this.ensureOwnerShip(idea, userId);
        
        await this.ideaRepository.update({id}, data);
        idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'comments'] })
        return this.toResponseObject(idea);
    }

    async destroy(id: string, userId: string) {
        const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'comments'] });
        if(!idea) {
            throw new HttpException('Not found idea', HttpStatus.NOT_FOUND);
        }

        this.ensureOwnerShip(idea, userId);

        await this.ideaRepository.delete({ id });
        return this.toResponseObject(idea);
    }

    private toResponseObject(idea: IdeaEntity): IdeaRO {
        const responseObject: any = {...idea, author: idea.author.toResponseObject(false) };

        if(responseObject.upvotes) {
            responseObject.upvoates = idea.upvotes.length;
        }

        if(responseObject.downvotes) {
            responseObject.downvotes = idea.downvotes.length;
        }

        return responseObject;
    }

    private ensureOwnerShip(idea: IdeaEntity, userId: string) {
        if(idea.author.id !== userId) {
            throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
        }
    }

    async bookmark(id: string, userId: string) {
        
        const idea = await this.ideaRepository.findOne({where: { id } });
        const user = await this.userRepository.findOne({where: { id: userId }, relations: ['bookmarks']});
       
        // nếu idea chưa tồn tại trong đánh dấu thì đánh dấu nó, user.bookmarks sẽ lưu 1 mảng các idea được đánh dấu giống relationship trong laravel
        if(user.bookmarks.filter(bookmark => bookmark.id === idea.id).length < 1) {
            user.bookmarks.push(idea);
            await this.userRepository.save(user);
        } else {
            throw new HttpException('Idea already bookmarked', HttpStatus.BAD_REQUEST);
        }

        return user.toResponseObject()
    }


    async unbookmark(id: string, userId: string) {
        const idea = await this.ideaRepository.findOne({where: { id } });
        const user = await this.userRepository.findOne({where: { id: userId }, relations: ['bookmarks']});

        // check xem đã có bookmark nào hay chưa. Nếu có rồi thì filter ra những thằng khác với idea.id được truyền vào ra rồi lưu lại vào bookmark
        if(user.bookmarks.filter(bookmark => bookmark.id === idea.id).length > 0) {
            user.bookmarks = user.bookmarks.filter(bookmark => bookmark.id !== idea.id);
            await this.userRepository.save(user);
        } else {
            throw new HttpException('Idea already unbookmarked', HttpStatus.BAD_REQUEST);
        }

        return user.toResponseObject()
    }

    async upvote(id: string, userId: string) {
        let idea = await this.ideaRepository.findOne({where: { id }, relations: ['author', 'upvotes', 'downvotes', 'comments']});
        const user = await this.userRepository.findOne({where: { id:userId }});
        idea = await this.vote(idea, user, Votes.UP);

        return this.toResponseObject(idea);
    }

    async downvote(id: string, userId: string) {
        let idea = await this.ideaRepository.findOne({where: { id }, relations: ['author', 'upvotes', 'downvotes', 'comments']});
        const user = await this.userRepository.findOne({where: { id:userId }});
        idea = await this.vote(idea, user, Votes.DOWN);
        
        return this.toResponseObject(idea);
    }

    private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes) {
        const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;

        if(idea[opposite].filter(voter => voter.id === user.id).length > 0 || idea[vote].filter(voter => voter.id === user.id).length > 0) {
            idea[opposite] = idea[opposite].filter(voter => voter.id !== user.id);
            idea[vote] = idea[vote].filter(voter => voter.id !== user.id);
            await this.ideaRepository.save(idea);
        } else if(idea[vote].filter(voter => voter.id === user.id).length < 1) {
            idea[vote].push(user);
            await this.ideaRepository.save(idea);
        } else {
            throw new HttpException('Unable to cast vote', HttpStatus.BAD_REQUEST);
        }

        return idea;
    }
}
