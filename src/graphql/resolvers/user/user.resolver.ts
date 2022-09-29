import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { Service } from "typedi";
import config from "../../../config";
import Context from "../../context";
import Message from "../message/message.type";
import { MessagesLoader } from "../message/messages.loaders";
import User from "./user.type";
import { UsersLoader } from "./users.loaders";

@Service()
@Resolver(User)
export default class UserResolver {
    constructor(private readonly usersService: UsersLoader, private readonly messagesLoader: MessagesLoader) {}

    /**
     * Me Query
     */
    @Query(returns => User)
    async me(@Ctx() { userId }: Context): Promise<User> {
        if (!userId) {
            throw new Error(`Not authenticated`);
        }

        const user = await this.usersService.batchUsers.load(userId);

        if (!user) {
            throw new Error(`User does not exist`);
        }

        return {
            id: user._id,
            name: user.name,
            inbox: undefined,
            unreadMessageCount: undefined,
        };
    }

    /**
     * User's inbox
     */
    @FieldResolver()
    async inbox(@Root() user: User, @Ctx() { userId }: Context): Promise<Partial<Message>[]> {
        // lookup the messages for a user from messages table

        const messages = await this.messagesLoader.batchReceivedMessages.load(userId || "");

        return messages.map(message => ({
            id: message.id,
            contents: message.contents,
            to: message.to as any,
            from: message.from as any,
        }));
    }

    /**
     * Unread message count for a user
     */
    @FieldResolver()
    async unreadMessageCount(@Root() user: User, @Ctx() { userId }: Context): Promise<User["unreadMessageCount"]> {
        // do a count on the DB for messages count
        const messages = await this.messagesLoader.batchReceivedMessages.load(userId || "");
        return messages.length;
    }

    /**
     * Login mutation
     */
    @Mutation(returns => String)
    async login(@Arg("email") email: string, @Arg("password") password: string, @Ctx() { database }: Context) {
        const record = await database.UserModel.findOne({ email });

        if (!record) {
            throw new Error(`Incorrect password`);
        }

        const correct = await bcrypt.compare(password, record.password);

        if (!correct) {
            throw new Error(`Invalid credentials`);
        }

        return jwt.sign({ userId: record._id }, config.auth.secret, { expiresIn: "1h" });
    }

    /**
     * Register new user
     */
    @Mutation(returns => String)
    async register(@Arg("email") email: string, @Arg("password") password: string, @Ctx() { database }: Context) {
        const existing = await database.UserModel.findOne({ email });

        if (existing) {
            throw new Error(`User exists!`);
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const user = await database.UserModel.create({
            email,
            password: hash,
        });

        return jwt.sign({ userId: user._id }, config.auth.secret, { expiresIn: "1h" });
    }
}
