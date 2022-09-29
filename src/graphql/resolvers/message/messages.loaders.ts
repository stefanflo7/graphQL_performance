import { mongoose } from "@typegoose/typegoose";
import DataLoader from "dataloader";
import { Service } from "typedi";
import { MessageModel } from "../../../database/models";
import Message from "./message.type";

@Service()
export class MessagesLoader {
    public readonly batchReceivedMessages = new DataLoader(async (recipientUsersIds: readonly string[]) => {
        // Get all messages for the recipients
        const messages = await MessageModel.find()
            .where("to")
            .in(recipientUsersIds.map(id => new mongoose.Types.ObjectId(id)));

        // Create the mapping from recipient userId to Messages
        const messagesMap = messages.reduce<Record<string, Message[]>>(
            (acc, curr) => ({
                ...acc,
                [curr.to as any]: [...(acc[curr.to as any] || []), curr],
            }),
            {},
        );

        // Return the array of users
        return recipientUsersIds.map(userId => messagesMap[userId]);
    });
}
