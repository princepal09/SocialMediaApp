import express, {Express, Request, Response} from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import testRoutes from '../src/routes/test.route.js'
import authRoutes from '../src/routes/user.route.js'
import { env } from './constants.js';
export const app = express() as Express;

app.use(cors({
    origin : [env.CORS_ORIGIN],
    credentials : true
}));
app.use(express.json());
app.use(cookieParser())


app.use("/api/v1/test",testRoutes)
app.use("/api/v1/auth",authRoutes)

app.get('/', (req:Request, res : Response) =>{
    return res.json({
        success : true,
        message : "Your Server is running Up...."
    })
})