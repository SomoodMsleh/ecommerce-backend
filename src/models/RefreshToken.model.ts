import mongoose ,{Schema, model, Document} from "mongoose";

interface IRefreshToken extends Document {
    user : mongoose.Types.ObjectId;
    token : string;
    expiresAt : Date;
    createdAt : Date;
}

const RefreshTokenSchema : Schema<IRefreshToken> = new Schema({
    user:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token:{
        type: String,
        required: true,
        unique: true,
    },
    expiresAt:{
        type: Date,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
        required: true,
    }
});

const RefreshTokenModel = mongoose.models.RefreshToken || model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
export default RefreshTokenModel;