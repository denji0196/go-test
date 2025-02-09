"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IoMdAdd } from "react-icons/io";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SpinnerBorder } from "../ui/spinner";

const TodoForm = () => {
  const [newTodo, setNewTodo] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Focus input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const { mutate: createTodo, isPending: isCreating } = useMutation({
    mutationKey: ["createTodo"],  // ใช้ mutationKey ที่ตรงกัน
    mutationFn: async () => {
      if (!newTodo.trim()) {
        alert("Please enter a todo!");
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/todos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: newTodo }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");

        setNewTodo(""); // เคลียร์ input เมื่อสำเร็จ
        return data;
      } catch (error: any) {
        console.error("Error creating todo:", error);
        alert(error.message || "Error creating todo");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] }); // รีเฟรชข้อมูล Todos
    },
    onError: (error: any) => {
      console.error("Error:", error);
      alert(error.message);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createTodo();
      }}
    >
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo..."
          className="border p-2 rounded-md"
        />
        <Button
          type="submit"
          className="mx-2 flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-md active:scale-[0.97] transition"
        >
          {isCreating ? <SpinnerBorder /> : <IoMdAdd size={30} />}
        </Button>
      </div>
    </form>
  );
};

export default TodoForm;
