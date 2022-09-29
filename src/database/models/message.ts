import { getModelForClass, index, prop, Ref } from "@typegoose/typegoose";
import { User } from "./user";

@index({ from: 1 }, { unique: false })
@index({ to: 1 }, { unique: false })
export class Message {
    @prop({ ref: User })
    public from!: Ref<User>;

    @prop({ ref: User })
    public to!: Ref<User>;

    @prop()
    public contents!: string;

    @prop({ default: false })
    public read!: boolean;
}

const MessageModel = getModelForClass(Message);

export default MessageModel;
