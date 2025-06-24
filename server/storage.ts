import {
  users,
  tasks,
  type User,
  type InsertUser,
  type Task,
  type InsertTask,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations for Ordo Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number, userId: number): Promise<Task | undefined>;
  createTask(task: InsertTask & { userId: number }): Promise<Task>;
  updateTask(id: number, userId: number, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number, userId: number): Promise<boolean>;
  toggleTaskComplete(id: number, userId: number): Promise<Task | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number, userId: number): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    return task;
  }

  async createTask(taskData: InsertTask & { userId: number }): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(taskData)
      .returning();
    return task;
  }

  async updateTask(id: number, userId: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return task;
  }

  async deleteTask(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async toggleTaskComplete(id: number, userId: number): Promise<Task | undefined> {
    const task = await this.getTask(id, userId);
    if (!task) return undefined;
    
    const [updatedTask] = await db
      .update(tasks)
      .set({ 
        completed: !task.completed,
        updatedAt: new Date()
      })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return updatedTask;
  }
}

export const storage = new DatabaseStorage();
