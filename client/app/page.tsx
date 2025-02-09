import TodoForm from "@/components/ListItem/TodoCreate";
import { TodoList } from "@/components/ListItem/TodoList";

const page = () => {
  return (
    <div>
      
      <TodoForm/>
      <TodoList/>
      
    </div>
  );
};
export default page;
