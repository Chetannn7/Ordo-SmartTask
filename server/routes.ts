import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // Auth middleware
  setupAuth(app);

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Received task data:", req.body);
      const userId = req.user.id;
      const taskData = insertTaskSchema.parse(req.body);
      console.log("Validated task data:", taskData);
      const task = await storage.createTask({ ...taskData, userId });
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const taskId = parseInt(req.params.id);
      const updates = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(taskId, userId, updates);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });

  app.delete('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const taskId = parseInt(req.params.id);
      const deleted = await storage.deleteTask(taskId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  app.patch('/api/tasks/:id/toggle', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const taskId = parseInt(req.params.id);
      const task = await storage.toggleTaskComplete(taskId, userId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error toggling task:", error);
      res.status(500).json({ message: "Failed to toggle task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
