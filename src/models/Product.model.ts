import mongoose, { Schema, model, Document, Types } from "mongoose";


export interface IProductVariant{
    size?: string;
    color?: string;
    price: number;
    stock: number;
    sku: string;
}

export interface IProduct extends Document{
    name: string;
    slug: string;
    description: string;
    category: Types.ObjectId;
    subCategory?: Types.ObjectId;
    price: number; // Base price
    comparePrice?: number; // Old price (for discounts)

    images: { secure_url: string; public_id: string; }[];

    variants?: IProductVariant[];  // Preferred inventory method
    sku: string; // Stock Keeping Unit

    tags?: string[]; // ketwords for search optimization

    isFeatured: boolean; // Featured product on homepage
    isActive: boolean; 
    

    averageRating: number;
    totalReviews: number;
    soldCount: number;

    createdAt: Date;
    updatedAt: Date;

}

const productSchema = new Schema<IProduct>({
    name:{
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    slug:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        maxlength: 5000,
    },
    category:{
        type: Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subCategory:{
        type: Types.ObjectId,
        ref: 'Category',
    },

    price:{
        type: Number,
        required: true,
        min: 0,
    },
    comparePrice:{
        type:Number,
        min:0,
    },

    images:[{
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
    }],

    variants:[{
        size: String,
        color: String,
        price: { type: Number, required: true },
        stock: { type: Number, required: true, min: 0 },
        sku: { type: String, required: true },
    }],
    sku:{
        type: String,
        required: true,
        unique: true,
    },

    tags:[{ type: String }],
    isFeatured:{
        type: Boolean,
        default: false
    },
    isActive:{
        type: Boolean,
        default: true
    },

    averageRating:{
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews:{
        type: Number,
        default: 0
    },

    soldCount:{
        type: Number,
        default: 0
    },

},{timestamps:true});

productSchema.index({ slug: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

const productModel = mongoose.models.Product || model<IProduct>('Product',productSchema);

export default productModel;