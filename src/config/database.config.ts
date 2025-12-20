import mongoose from 'mongoose';
import logger  from '../utils/logger.util.js';

const connectDB = async (): Promise<void> => {
    try{
        const options = {
            maxPoolSize : 10,  // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // close sockets after 45 seconds of inactivity
        }
        await mongoose.connect(process.env.DB_URL!, options); // (!) to assert that DB_URL is not undefined 
        logger.info('✅ MongoDB connected successfully');

        mongoose.connection.on('error', (err)=>{
            logger.error('❌ MongoDB connection error: ', err);
        }); // listen for errors after initial connection

        mongoose.connection.on('disconnected' , ()=>{
            logger.warn(' MongoDB disconnected! trying to reconnect...')
        }); // listen for disconnection events

    }catch(error){
        logger.error('❌ mongoDB connection error: ', error);
        process.exit(1); // exit process with failure
    }
};

export default connectDB;