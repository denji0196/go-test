import { NextResponse } from "next/server"

export const middleware =(req:Request) =>{
    console.log("hello middleware")
    return NextResponse.redirect(new URL("/",req.url))
}

export const config = {
    matcher:'/about/:path*'
}