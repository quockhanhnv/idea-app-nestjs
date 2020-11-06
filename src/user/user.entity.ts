import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { response } from "express";
import { UserRO } from "./user.dto";
import { IdeaEntity } from "src/idea/idea.entity";
import { type } from "os";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @CreateDateColumn()
    created: Date;

    @Column({
        // type: 'text',
        unique: true
    })
    username: string;

    @Column('text')
    password: string;

    @OneToMany(type => IdeaEntity, idea => idea.author)
    ideas: IdeaEntity[];

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    toResponseObject(showToken: boolean = true): UserRO {
        const { id, created, username, token } = this;
        
        const responseObject: any = { id, created, username };

        if(showToken) {
            responseObject.token = token;
        }

        return responseObject;
    }

    async comparePassword(attempt: string) {
        return await bcrypt.compare(attempt, this.password);
    }

    private get token() {
        const { id, username } = this;

        return jwt.sign({
           id, username 
        }, process.env.SECRET, { expiresIn: '7d'})
    }
}