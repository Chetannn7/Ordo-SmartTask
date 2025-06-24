import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateTaskModal } from "@/components/create-task-modal";
import { CheckCheck, Plus, LogOut, Edit, Circle, CheckCircle, Calendar, User, MoreVertical, Trash2, Target, Users, Clock } from "lucide-react";
import type { Task } from "@shared/schema";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: !!user,
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await apiRequest("PATCH", `/api/tasks/${taskId}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      await apiRequest("PATCH", `/api/tasks/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task moved",
        description: "Task priority updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to move task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    return task.priority === filter;
  });

  const priorityTasks = tasks.filter(task => task.priority === "priority");
  const delegateTasks = tasks.filter(task => task.priority === "delegate");
  const nonessentialTasks = tasks.filter(task => task.priority === "nonessential");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "priority": return "bg-red-500";
      case "delegate": return "bg-blue-500";
      case "nonessential": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case "priority": return "border-red-200";
      case "delegate": return "border-blue-200";
      case "nonessential": return "border-gray-200";
      default: return "border-gray-200";
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "No deadline";
    const taskDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (taskDate.toDateString() === today.toDateString()) return "Today";
    if (taskDate.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return taskDate.toLocaleDateString();
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className={`p-4 border ${getPriorityBorderColor(task.priority)} rounded-lg hover:shadow-md transition-shadow cursor-pointer ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className={`font-medium text-gray-900 ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
          <div className="flex items-center mt-2 text-xs text-gray-500">
            {task.priority === "delegate" ? (
              <>
                <User className="w-3 h-3 mr-1" />
                <span>Assigned task</span>
              </>
            ) : (
              <>
                <Calendar className="w-3 h-3 mr-1" />
                <span>{formatDate(task.dueDate)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 hover:text-orange-600 transition-colors p-1">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Move to</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {task.priority !== "priority" && (
                <DropdownMenuItem onClick={() => updateTaskMutation.mutate({ id: task.id, updates: { priority: "priority" } })}>
                  <Target className="w-4 h-4 mr-2 text-red-500" />
                  Priority
                </DropdownMenuItem>
              )}
              {task.priority !== "delegate" && (
                <DropdownMenuItem onClick={() => updateTaskMutation.mutate({ id: task.id, updates: { priority: "delegate" } })}>
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  Delegate
                </DropdownMenuItem>
              )}
              {task.priority !== "nonessential" && (
                <DropdownMenuItem onClick={() => updateTaskMutation.mutate({ id: task.id, updates: { priority: "nonessential" } })}>
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  Non-essential
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => deleteTaskMutation.mutate(task.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={() => toggleTaskMutation.mutate(task.id)}
            className="text-gray-400 hover:text-green-500 transition-colors"
            disabled={toggleTaskMutation.isPending}
          >
            {task.completed ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-25 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-25 via-white to-orange-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                <CheckCheck className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">Ordo</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-200">{user?.name || user?.username || "User"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Tasks</h2>
            <p className="mt-1 text-gray-600">Stay organized and prioritize what matters most</p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-lg rounded-xl transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl border-2 border-orange-400"
          >
            <Plus className="w-5 h-5 mr-3" />
            Create Task
          </Button>
        </div>

        {/* Task Filters */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border border-orange-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter by Priority:</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className={filter === "all" ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-400" : "border-orange-200 text-orange-700 hover:bg-orange-50"}
                >
                  All Tasks
                </Button>
                <Button
                  variant={filter === "priority" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("priority")}
                  className={filter === "priority" ? "bg-red-500 text-white" : "text-red-700 border-red-200 hover:bg-red-50"}
                >
                  Priority
                </Button>
                <Button
                  variant={filter === "delegate" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("delegate")}
                  className={filter === "delegate" ? "bg-blue-500 text-white" : "text-blue-700 border-blue-200 hover:bg-blue-50"}
                >
                  Delegate
                </Button>
                <Button
                  variant={filter === "nonessential" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("nonessential")}
                  className={filter === "nonessential" ? "bg-gray-500 text-white" : "text-gray-700 border-gray-200 hover:bg-gray-50"}
                >
                  Non-essential
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Priority Tasks */}
          <Card className="bg-white/80 backdrop-blur-sm border border-red-100 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  Priority
                </h3>
                <Badge className="bg-red-100 text-red-800">
                  {priorityTasks.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasksLoading ? (
                <>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </>
              ) : priorityTasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No priority tasks</p>
              ) : (
                priorityTasks.map(task => <TaskCard key={task.id} task={task} />)
              )}
            </CardContent>
          </Card>

          {/* Delegate Tasks */}
          <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  Delegate
                </h3>
                <Badge className="bg-blue-100 text-blue-800">
                  {delegateTasks.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasksLoading ? (
                <>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </>
              ) : delegateTasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No delegate tasks</p>
              ) : (
                delegateTasks.map(task => <TaskCard key={task.id} task={task} />)
              )}
            </CardContent>
          </Card>

          {/* Non-essential Tasks */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                  Non-essential
                </h3>
                <Badge className="bg-gray-100 text-gray-800">
                  {nonessentialTasks.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasksLoading ? (
                <>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </>
              ) : nonessentialTasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No non-essential tasks</p>
              ) : (
                nonessentialTasks.map(task => <TaskCard key={task.id} task={task} />)
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
