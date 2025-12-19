import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.get('/',(req,res)=>{
    res.json({message: "Hello, world!"});
});
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT} ....`);
})