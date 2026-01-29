import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IWishlist extends Document{
    user:Types.ObjectId;
    products:Types.ObjectId[];
    createdAt:Date;
    updatedAt:Date;
};

const wishlistSchema: Schema<IWishlist> = new Schema({
    user:{
        type:Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    products:[{
        type: Types.ObjectId,
        ref: 'Product'
    }]
},{timestamps:true});

wishlistSchema.index({user:1});
const wishlistModel = mongoose.models.Wishlist || model<IWishlist>('Wishlist',wishlistSchema);
export default wishlistModel;