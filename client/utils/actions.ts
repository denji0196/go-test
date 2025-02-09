'use server'

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"


export const createCamp = async(prevState,formData)=>{
    // const title = formData.get('title')
    // const location = formData.get('location')
    const rawData = Object.fromEntries(formData)
    console.log(rawData)
    revalidatePath('/info')
    // redirect('/')

    return 'create success'

}
export const fetchCamp  = async() => {
    const camps = [
        {id:1,title:"aa"},
        {id:2,title:"bb"},
        {id:3,title:"cc"}
    ]
    return camps
}