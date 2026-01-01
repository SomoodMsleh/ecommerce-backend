import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface ICategory extends Document {
    name:string;
    slug:string;
    description?:string;
    parent?:Types.ObjectId;
    image?:{ secure_url: string, public_id?: string; };
    isActive:boolean;
    createdAt: Date;
    updatedAt: Date;
};

const categorySchema:Schema<ICategory> = new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim: true
    },
    slug:{
        type:String,
        required: true, 
        unique: true, 
        lowercase: true ,
        trim: true
    },
    description:{
        type:String
    },
    parent:{
        type:Types.ObjectId,
        ref:'Category'
    },
    image:{
        secure_url: { type: String },
        public_id: { type: String }
    },
    isActive:{
        type: Boolean, 
        default: true
    },

},{timestamps:true});

categorySchema.index({ slug: 1 });
const categoryModel = mongoose.models.Category || model<ICategory>('Category',categorySchema);

export default categoryModel;