import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface ICartItem {
    product: Types.ObjectId;
    quantity: number;
    price: number;
    variant?: {
        sku?: string;
        size?: string;
        color?: string;
    }
}

export interface ICart extends Document {
    user: Types.ObjectId;
    items: ICartItem[];
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
};

const cartSchema: Schema<ICart> = new Schema({
    user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: {
        type: [{
            product: {
                type: Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            },
            price: {
                type: Number,
                required: true,
                min: 0
            },
            variant: {
                sku: String,
                size: String,
                color: String
            }


        }],
        default: []
    },
    totalAmount: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });

cartSchema.index({ user: 1 });

const cartModel = mongoose.models.Cart || model<ICart>('Cart', cartSchema);
export default cartModel;
