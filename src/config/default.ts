import * as dotenv from "dotenv";
import { Config } from "./types";
dotenv.config();

const config: Config = {
    database: {
        //process.env.MONGO_URL ||
        uri: "mongodb://localhost/yulife-performance",
    },
    auth: {
        //process.env.AUTH_SECRET ||
        secret: "sfdgr8rqw734r734je!ejw47dwer£",
    },
    frontend: {
        selfUrl: "http://localhost:5000/app",
    },
};

export default config;
