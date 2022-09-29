import { Arg, Ctx, FieldResolver, Mutation, Resolver, Root } from "type-graphql";
import { Service } from "typedi";
import { random } from "../../../utils/math";
import Context from "../../context";
import User from "../user/user.type";
import { UsersLoader } from "../user/users.loaders";
import Message from "./message.type";

@Service()
@Resolver(Message)
export default class MessageResolver {
    constructor(private readonly usersService: UsersLoader) {}

    /**
     * Looks up and returns the recipient
     */
    @FieldResolver()
    async to(@Root() { to }: Message): Promise<User | null> {
        if (!to) {
            return null;
        }

        const user = await this.usersService.batchUsers.load(to as any as string);

        if (!user) {
            return null;
        }

        return {
            id: user._id,
            name: user.name,
            unreadMessageCount: undefined,
            inbox: undefined,
        };
    }

    /**
     * Looks up and returns the sender
     */
    @FieldResolver()
    async from(@Root() { from }: Message): Promise<Partial<User> | null> {
        if (!from) {
            return null;
        }

        const user = await this.usersService.batchUsers.load(from as any as string);

        if (!user) {
            return null;
        }

        return {
            id: user._id,
            name: user.name,
            unreadMessageCount: undefined,
            inbox: undefined,
        };
    }

    /**
     * Sends a message to a random user
     */
    @Mutation(type => Message)
    async sendRandomMessage(
        @Ctx() { database, userId }: Context,
        @Arg("message") message: string,
    ): Promise<Partial<Message>> {
        if (!userId) {
            throw new Error(`Not authenticated`);
        }

        const count = await database.UserModel.countDocuments({});
        const to = await database.UserModel.findOne({ id: { $ne: userId } })
            .skip(random(0, count))
            .select("_id");

        const record = await database.MessageModel.create({
            from: userId,
            to: to?.id,
            contents: message,
            read: false,
        });

        return {
            id: record.id,
            contents: message,
            to: to?.id,
            from: userId as any,
        };
    }

    /**
     * Sets a message as seen
     */
    @Mutation(returns => Message)
    async markMessageAsSeen(@Arg("messageId") messageId: string, @Ctx() { database, userId }: Context) {
        const message = await database.MessageModel.findOne({ _id: messageId, to: userId });

        if (!message) {
            throw new Error(`Message does not exist!`);
        }

        await database.MessageModel.updateOne({ _id: messageId, to: userId }, { read: true });

        return database.MessageModel.findOne({ _id: messageId, to: userId });
    }
}
