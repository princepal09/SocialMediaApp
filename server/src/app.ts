import express, {Express, Request, Response} from 'express'

export const app = express() as Express;




app.get('/', (req:Request, res : Response) =>{
    return res.json({
        success : true,
        message : "Your Server is running Up...."
    })
})