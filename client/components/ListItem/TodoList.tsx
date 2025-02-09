"use client";
import { useState } from "react";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Todo = {
  _id: string;
  completed: boolean;
  body: string;
  created_at: string;
};

// ฟังก์ชันลบ Todo
const deleteTodo = async (id: string) => {
  const res = await fetch(`http://localhost:5000/api/todos/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Error deleting todo");
  }

  return res.json();
};

const updateTodoStatusAndBody = async ({
  id,
  completed,
  newBody,
}: {
  id: string;
  completed: boolean;
  newBody: string;
}) => {
  const res = await fetch(`http://localhost:5000/api/todos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed, body: newBody }), // ส่งทั้ง completed และ body
  });

  if (!res.ok) {
    throw new Error("Error updating todo");
  }

  return res.json();
};

export function TodoList() {
  const queryClient = useQueryClient();

  // ดึงข้อมูล todos
  const {
    data: todos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/todos");
      if (!res.ok) {
        throw new Error("Error fetching todos");
      }
      return res.json();
    },
  });

  // Mutation สำหรับการอัปเดตทั้งสถานะและ body
  const mutation = useMutation({
    mutationFn: updateTodoStatusAndBody,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // สถานะการแสดงฟอร์มแก้ไข
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newBody, setNewBody] = useState<string>("");

  // ฟังก์ชันอัปเดต Todo โดยส่งทั้ง body และ completed ขึ้นอยู่กับเงื่อนไข
  const [isStatusUpdate, setIsStatusUpdate] = useState(false);

  const handleUpdateTodo = async () => {
    if (editingTodo) {
      try {
        // ถ้าเป็นการแก้ไขสถานะ (กดที่ปุ่ม Status)
        if (isStatusUpdate) {
          await mutation.mutateAsync({
            id: editingTodo._id,
            completed: editingTodo.completed, // เปลี่ยนแค่ completed
            newBody: editingTodo.body, // body เดิม
          });
        } else {
          await mutation.mutateAsync({
            id: editingTodo._id,
            completed: editingTodo.completed, // ค่าของ completed เดิม
            newBody: newBody, // body ใหม่ที่ถูกแก้ไข
          });
        }

        // รีเซ็ตสถานะหลังการอัปเดต
        setEditingTodo(null); // ปิดฟอร์ม
        setNewBody(""); // รีเซ็ตค่าฟอร์ม
        setIsStatusUpdate(false); // รีเซ็ตตัวแปรสถานะการอัปเดต
      } catch (error) {
        console.error("Failed to update todo:", error);
      }
    }
  };

  // ฟังก์ชันสำหรับการเปลี่ยนสถานะ
  const handleStatusChange = (todoId: string, currentCompleted: boolean, newBody: string) => {
    setIsStatusUpdate(true); // ตั้งค่าเป็นการอัปเดตสถานะ
  
    // เรียกใช้ mutation เพื่ออัปเดตสถานะและ body
    mutation.mutateAsync({
      id: todoId,
      completed: !currentCompleted, // เปลี่ยนสถานะ
      newBody: newBody, // ส่ง body ไปด้วย (ถ้าค่า body เปลี่ยนแปลง)
    }).then(() => {
      // เคลียร์สถานะหลังจากการอัปเดตสำเร็จ
      setEditingTodo(null); // ปิดฟอร์ม
      setNewBody(""); // รีเซ็ตค่าฟอร์ม
      setIsStatusUpdate(false); // รีเซ็ตตัวแปรสถานะการอัปเดต
    }).catch((error) => {
      console.error("Failed to update status:", error);
    });
  };

  // การเปิดฟอร์มแก้ไข
  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setNewBody(todo.body); // ตั้งค่า newBody ให้ตรงกับ body ของ todo
  };

  // กำหนดคอลัมน์ของตาราง
  const columns: ColumnDef<Todo>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "completed",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const isCompleted = row.getValue("completed") as boolean;
        const todoId = row.original._id;
        const todoBody = row.original.body; // ดึงค่า body ของ todo ที่กำลังแสดง

        const handleStatusClick = () => {
          handleStatusChange(todoId, isCompleted, todoBody); // ส่งทั้ง todoId, completed, และ body
        };

        return (
          <Button
            variant={isCompleted ? "default" : "outline"}
            onClick={handleStatusClick}
          >
            {isCompleted ? "Completed" : "In Progress"}
          </Button>
        );
      },
    },
    {
      accessorKey: "body",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Detail
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("body")}</div>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return <div>{new Date(date).toLocaleDateString()}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const todo = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  // เปิดฟอร์มแก้ไขและตั้งค่าข้อมูลในฟอร์ม
                  setEditingTodo(todo);
                  setNewBody(todo.body); // ตั้งค่า newBody ให้ตรงกับ body ของ todo ที่เลือก
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to delete this item?")
                  ) {
                    deleteMutation.mutate(todo._id);
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];


  const { getHeaderGroups, getRowModel, getState, setPageSize } = useReactTable(
    {
      data: todos || [],
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error instanceof Error) return <div>{error.message}</div>;

  return (
    <>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Todo List</h1>
        <div className="flex justify-between items-center">
        {editingTodo && (
        <div className="space-x-4">
          <Input
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Edit todo"
            className="w-full max-w-md"
          />
          <Button 
            onClick={handleUpdateTodo} 
            className="px-4 py-2 text-sm"
          >
            Save Changes
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setEditingTodo(null)} 
            className="px-4 py-2 text-sm"
          >
            Cancel
          </Button>
        </div>
      )}
        </div>
        <Table>
          <TableHeader>
            {getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
