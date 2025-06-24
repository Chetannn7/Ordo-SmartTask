import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCheck } from "lucide-react";
import { LoadingRedirect } from "@/components/loading-redirect";
import { z } from "zod";

type LoginFormData = z.infer<typeof loginUserSchema>;
type RegisterFormData = z.infer<typeof insertUserSchema>;

export default function AuthPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("login");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await apiRequest("POST", "/api/login", data);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.name}`,
      });
      // Force redirect to dashboard
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Account created!",
        description: `Welcome to Ordo, ${user.name}!`,
      });
      // Force redirect to dashboard
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message.includes("already exists") ? "Username already taken" : "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  if (isRedirecting) {
    return <LoadingRedirect message="Taking you to your dashboard..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Orange wave background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute bottom-0 left-0 w-full h-full opacity-10"
          viewBox="0 0 1440 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,229.3C672,256,768,288,864,293.3C960,299,1056,277,1152,250.7C1248,224,1344,192,1392,176L1440,160L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"
            fill="url(#gradient)"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>
        <svg
          className="absolute top-0 right-0 w-full h-full opacity-5"
          viewBox="0 0 1440 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,160L48,176C96,192,192,224,288,250.7C384,277,480,299,576,293.3C672,288,768,256,864,229.3C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            fill="url(#gradient2)"
          />
          <defs>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
            <CheckCheck className="text-white text-3xl" />
          </div>
          <h1 className="mt-6 text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">Ordo</h1>
          <p className="mt-3 text-lg text-gray-700 font-medium">Organize your tasks with priority</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-100">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Join Ordo!</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-orange-50">
                <TabsTrigger value="login" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your username"
                              {...field}
                              className="focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              {...field}
                              className="focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              {...field}
                              className="focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Choose a username"
                              {...field}
                              className="focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Create a password"
                              {...field}
                              className="focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}