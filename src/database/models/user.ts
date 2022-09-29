import { getModelForClass, index, prop } from "@typegoose/typegoose";

@index({ email: 1 }, { unique: true })
export class User {
    @prop()
    public id!: string;

    @prop()
    public name?: string;

    @prop()
    public email!: string;

    @prop()
    public password!: string;
}

const UserModel = getModelForClass(User);

export default UserModel;
