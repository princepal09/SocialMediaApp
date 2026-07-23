import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Request, Response } from "express";

export const test = (req:Request, res:Response) =>{
    try{
        
        return res.status(200).json(
            new ApiResponse(200,"helo","succesfffulyy")
        )

    }catch(err:any){
        console.error(err);
        return res.status(500).json(
            new ApiError(500, "Internal server error", err.message)
        )
    }
}