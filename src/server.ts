import connectDB from "./db";
import app from "./app";



connectDB();


app.listen(process.env.PORT, () => {
    console.log(`server is running on http://localhost:${process.env.PORT}`);
    
})

