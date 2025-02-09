import TodoForm from "@/components/ListItem/TodoCreate";
import { TodoList } from "@/components/ListItem/TodoList";
import Link from "next/link";

const page = () => {
  return (
    <div>
      
      <TodoForm/>
      <TodoList/>
      
    </div>
  );
};
export default page;
