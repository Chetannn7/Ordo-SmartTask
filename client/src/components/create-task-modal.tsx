import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X } from "lucide-react";
import { z } from "zod";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = insertTaskSchema.extend({
  dueDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPriority, setSelectedPriority] = useState<string>("priority");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "priority",
      dueDate: "",
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const taskData = {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        completed: false,
      };
      console.log("Sending task data:", taskData);
      await apiRequest("POST", "/api/tasks", taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      form.reset({
        title: "",
        description: "",
        priority: "priority",
        dueDate: "",
      });
      setSelectedPriority("priority");
      onClose();
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
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createTaskMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset({
      title: "",
      description: "",
      priority: "priority",
      dueDate: "",
    });
    setSelectedPriority("priority");
    onClose();
  };

  const priorityOptions = [
    {
      value: "priority",
      label: "Priority",
      description: "Urgent and important tasks",
      color: "bg-red-500",
      hoverColor: "hover:bg-red-50 hover:border-red-200",
      ringColor: "ring-red-500",
    },
    {
      value: "delegate",
      label: "Delegate",
      description: "Tasks to assign to others",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-50 hover:border-blue-200",
      ringColor: "ring-blue-500",
    },
    {
      value: "nonessential",
      label: "Non-essential",
      description: "Nice to have, low priority",
      color: "bg-gray-500",
      hoverColor: "hover:bg-gray-50 hover:border-gray-300",
      ringColor: "ring-gray-500",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Create New Task
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter task title"
                      {...field}
                      className="focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task description"
                      rows={3}
                      {...field}
                      className="focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority Level</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {priorityOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer transition-all ${
                            option.hoverColor
                          } ${
                            field.value === option.value
                              ? `ring-2 ${option.ringColor} bg-orange-50`
                              : ""
                          }`}
                          onClick={() => {
                            field.onChange(option.value);
                            setSelectedPriority(option.value);
                          }}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 ${option.color} rounded-full mr-3`}></div>
                            <div>
                              <div className="font-medium text-gray-900">{option.label}</div>
                              <div className="text-sm text-gray-600">{option.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createTaskMutation.isPending}
                className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {createTaskMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
