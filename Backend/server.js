import express from 'express';
import dotenv from "dotenv";
import connectDB from "./config/DB.js";
import morgan from "morgan";
import dns from "dns";

//database cluster in frankfurt
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
app.use(morgan('dev'));


app.use(express.json());
dotenv.config();
const Port = process.env.PORT || 3001;
connectDB();





app.get('/', (req, res) => {
    res.send('Hi Team5 MEARN Assiut');
});

app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
});

