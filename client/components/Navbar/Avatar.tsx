import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatarpic"

  
  const AvatarIcon = () => {
    return (
    <Avatar className="h-9 w-9">
        <AvatarImage src="https://play-lh.googleusercontent.com/So4dgIQu4frCqskrYvQS6UJ2LupoY7bPpgzBu0keUywQmpkf-7CMhzefvqjmSJOKZxI" alt="@shadcn" className="h-9 w-9"/>
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    )
  }
  export default AvatarIcon