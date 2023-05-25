import mongoose from 'mongoose';
import {Password} from '../services/password';

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

userSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

userSchema.statics.build = (props: UserProps) => {
    return new User(props);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export {User};
