import mongoose from 'mongoose';

// Interface decribing the required properties for a new user
interface UserProps {
    email: string;
    password: string;
}

// Interface describing the properties of User Model
interface UserModel extends mongoose.Model<UserDoc> {
    build(props: UserProps): UserDoc;
}

// Interface describing the properties of a User Document
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

userSchema.statics.build = (props: UserProps) => {
    return new User(props);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export {User};
