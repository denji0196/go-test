import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatarpic"

  
  const AvatarIcon = () => {
    return (
    <Avatar className="h-9 w-9">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" className="h-9 w-9"/>
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    )
  }
  export default AvatarIcon