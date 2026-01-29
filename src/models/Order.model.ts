import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IOrderItem {
    product: Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    variant?: {
        sku?: string;
        size?: string;
        color?: string;
    };
    image?:{ secure_url: string; public_id: string; };
};

export interface IShippingAddress {
    _id: Types.ObjectId;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface IOrder extends Document {
    user: Types.ObjectId;
    orderNumber: string;
    items: IOrderItem[];
    totalAmount: number;
    shippingAddress: IShippingAddress;
    paymentMethod: 'stripe' | 'paypal' | 'cash_on_delivery';
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentId?: string;
    itemsTotal: number;
    shippingCost: number;
    tax: number;
    discount: number;
    notes?: string;
    cancelReason?: string;
    paidAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
    refundedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
};

const orderSchema: Schema<IOrder> = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
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
        },
        image: {
            secure_url: { type: String, required: true },
            public_id: { type: String, required: true },
        }
    }],
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'paypal', 'cash_on_delivery'],
        required: true,
        default: 'stripe'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        required: true,
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        required: true,
        default: 'pending'
    },
    paymentId: {
        type: String
    },
    itemsTotal: {
        type: Number,
        required: true,
        min: 0
    },
    shippingCost: {
        type: Number,
        default: 0,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    notes: {
        type: String
    },
    cancelReason: {
        type: String
    },
    paidAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    refundedAt: {
        type: Date
    }
},{timestamps: true});

orderSchema.pre("validate", function (this: IOrder) { // validate executed before data validation 
    this.itemsTotal = this.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    this.totalAmount = this.itemsTotal + this.shippingCost + this.tax -this.discount;
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

const orderModel = mongoose.models.Order || model<IOrder>('Order', orderSchema);
export default orderModel;