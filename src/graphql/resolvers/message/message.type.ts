import { Field, ID, ObjectType } from "type-graphql";
import { TypeormLoader } from "type-graphql-dataloader";
import { BaseEntity, Column, Entity, ManyToOne, ObjectIdColumn } from "typeorm";
import User from "../user/user.type";

@ObjectType()
@Entity()
class Message extends BaseEntity {
    @Field(type => ID)
    @ObjectIdColumn()
    id!: string;

    @Field()
    @Column()
    contents!: string;

    @Field()
    @ObjectIdColumn()
    @TypeormLoader()
    from?: User;

    @Field()
    @ObjectIdColumn()
    @ManyToOne(type => User, user => user.inbox)
    @TypeormLoader((message: Message) => message.to, { selfKey: true })
    to?: User;

    @Field()
    @Column()
    read!: string;
}

export default Message;
