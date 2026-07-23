import {Request, Response} from 'express'
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const registerUser = async(req:Request, res : Response) =>{
    try{
        let profileImageLocalPath;
        if(req.file?.path){
            profileImageLocalPath = req.file.path;
        }

        return res.status(201).json(
            new ApiResponse(201,{}, "User registered successfully!!")
        )


    }catch(err:any){
        console.error("ERROR", err);
        return res.status(500).json(
            new ApiError(500, "Internal Server Error", err)
        )

    }

}