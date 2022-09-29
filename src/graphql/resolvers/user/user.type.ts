import { Field, ID, ObjectType } from "type-graphql";
import { TypeormLoader } from "type-graphql-dataloader";
import { Column, Entity, ObjectIdColumn, OneToMany } from "typeorm";
import Message from "../message/message.type";

@ObjectType()
@Entity()
class User {
    @Field(type => ID)
    @ObjectIdColumn()
    id!: string;

    @Field({ nullable: true })
    @Column()
    name?: string;

    @Field()
    @Column()
    unreadMessageCount?: number;

    @Field(type => [Message])
    @Column()
    @TypeormLoader((message: Message) => message.to, { selfKey: true })
    @OneToMany(type => Message, message => message.to)
    inbox?: Message[];
}

export default User;
