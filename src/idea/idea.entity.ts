import { CommentEntity } from 'src/comment/comment.entity';
import { UserEntity } from 'src/user/user.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('idea')
export class IdeaEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column('text') idea: string;

    @Column('text') description: string;

    @CreateDateColumn() created: Date;

    @UpdateDateColumn() updated: Date;

    @ManyToOne(type => UserEntity, author => author.ideas)
    author: UserEntity;

    @ManyToMany(type => UserEntity, { cascade: true })
    @JoinTable()
    upvotes: UserEntity[];

    @ManyToMany(type => UserEntity, { cascade: true })
    @JoinTable()
    downvotes: UserEntity[];

    @OneToMany(type => CommentEntity, comment => comment.idea, { cascade: true })
    comments: CommentEntity[]
}