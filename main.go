package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Todo struct {
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Completed bool               `json:"completed"`
	Body      string             `json:"body"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
}

var collection *mongo.Collection

func main() {
	if os.Getenv("ENV") != "production" {

		err := godotenv.Load(".env")
		if err != nil {
			log.Fatal("Error loading .env file")
		}
	}

	MONGODB_URL := os.Getenv("MONGODB_URL")
	clientOptions := options.Client().ApplyURI(MONGODB_URL)
	client, err := mongo.Connect(context.Background(), clientOptions)

	if err != nil {
		log.Fatal(err)
	}

	defer client.Disconnect(context.Background())

	// ตรวจสอบการเชื่อมต่อ
	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to MONGODB ATLAS")

	// เลือกฐานข้อมูลและคอลเลกชัน
	collection = client.Database("golang_db").Collection("todos")

	// สร้าง Fiber app
	app := fiber.New()

	// ใช้ middleware CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins: "https://go-test-tawny.vercel.app", // ✅ ใส่ URL ของ Next.js
		AllowMethods: "GET,POST,PATCH,DELETE",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Routes
	app.Get("/api/todos", getTodos)
	app.Post("/api/todos", createTodos)
	app.Patch("/api/todos/:id", updateTodos)
	app.Delete("/api/todos/:id", deleteTodos)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	if os.Getenv("ENV") == "production" {
		app.Static("/", "./client/dist")
	}
	log.Fatal(app.Listen("0.0.0.0:" + port))
}

// ดึงข้อมูล Todos
func getTodos(c *fiber.Ctx) error {
	var todos []Todo

	// ค้นหาข้อมูลทั้งหมดจาก MongoDB
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		return err
	}
	defer cursor.Close(context.Background())

	// ดึงข้อมูลจาก cursor และเก็บไว้ใน todos
	for cursor.Next(context.Background()) {
		var todo Todo
		if err := cursor.Decode(&todo); err != nil {
			return err
		}
		todos = append(todos, todo)
	}

	return c.JSON(todos)
}

// สร้าง Todo ใหม่
func createTodos(c *fiber.Ctx) error {
	todo := new(Todo)

	// รับข้อมูลจาก request body
	if err := c.BodyParser(todo); err != nil {
		return err
	}

	if todo.Body == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Todo body cannot be empty"})
	}

	// กำหนดเวลา CreatedAt และ UpdatedAt
	todo.CreatedAt = time.Now()
	todo.UpdatedAt = time.Now()

	// บันทึก Todo ใหม่ลง MongoDB
	insertResult, err := collection.InsertOne(context.Background(), todo)
	if err != nil {
		return err
	}

	// กำหนด ID ที่เพิ่งสร้างให้กับ Todo
	todo.ID = insertResult.InsertedID.(primitive.ObjectID)

	return c.Status(201).JSON(todo)
}

// อัปเดต Todo
func updateTodos(c *fiber.Ctx) error {
	id := c.Params("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid todo ID"})
	}

	// ค้นหา Todo ด้วย ID
	var todo Todo
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&todo)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Todo not found"})
	}

	// รับข้อมูลใหม่จาก request body
	var requestData struct {
		Body      string `json:"body"`
		Completed bool   `json:"completed"`
	}

	if err := c.BodyParser(&requestData); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// อัปเดตข้อมูล
	todo.Body = requestData.Body // ตั้งค่า body ใหม่
	todo.Completed = requestData.Completed
	todo.UpdatedAt = time.Now()

	// อัปเดตข้อมูลใน MongoDB
	update := bson.M{
		"$set": bson.M{
			"completed":  todo.Completed,
			"updated_at": todo.UpdatedAt,
			"body":       todo.Body,
		},
	}
	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": objectID}, update)
	if err != nil {
		return err
	}

	// ส่งข้อมูล Todo กลับไป
	return c.Status(200).JSON(todo)
}

// ลบ Todo
func deleteTodos(c *fiber.Ctx) error {
	id := c.Params("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid todo ID"})
	}

	// ลบ Todo จาก MongoDB
	_, err = collection.DeleteOne(context.Background(), bson.M{"_id": objectID})
	if err != nil {
		return err
	}

	return c.Status(200).JSON(fiber.Map{"success": true})
}
