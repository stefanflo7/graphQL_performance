import { DocumentType, mongoose } from "@typegoose/typegoose";
import DataLoader from "dataloader";
import { Service } from "typedi";
import { UserModel } from "../../../database/models";
import User from "./user.type";

@Service()
export class UsersLoader {
    public readonly batchUsers = new DataLoader(async (usersIds: readonly string[]) => {
        // Get all users
        const users = await UserModel.find()
            .where("_id")
            .in(usersIds.map(id => new mongoose.Types.ObjectId(id)));

        const usersMap: Record<string, DocumentType<User>> = {};

        // Create the mapping from userId to user
        users.map(user => (usersMap[user._id] = user));

        // Return the array of users
        return usersIds.map(userId => usersMap[userId]);
    });
}
