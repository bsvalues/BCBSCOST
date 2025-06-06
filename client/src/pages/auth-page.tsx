import { useEffect, useState } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useAutoLogin } from "@/hooks/use-autologin";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Key, Loader2 } from "lucide-react";
import { APP_NAME } from "@/data/constants";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.string().default("user"),
  isActive: z.boolean().default(true),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { autoLoginEnabled, toggleAutoLogin } = useAutoLogin();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  // Handle auto-login
  useEffect(() => {
    if (autoLoginEnabled && !user && !loginMutation.isPending) {
      loginMutation.mutate({ username: "admin", password: "password" });
    }
  }, [autoLoginEnabled, user, loginMutation]);

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      role: "user",
      isActive: true,
    },
  });

  // Handle login form submission
  const onLoginSubmit = (data: LoginValues) => {
    loginMutation.mutate({ 
      username: data.username, 
      password: data.password 
    });
  };

  // Handle register form submission
  const onRegisterSubmit = (data: RegisterValues) => {
    registerMutation.mutate(data);
  };

  // If user is already logged in, redirect to home page
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Auth Form */}
      <div className="flex flex-col w-full md:w-1/2 p-8 justify-center">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="flex justify-center mb-8">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">{APP_NAME}</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to access the Building Cost Estimation Tool
            </p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="admin" {...field} />
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
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="remember"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Remember me</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>Sign In</>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter>
                  <div className="w-full flex items-center space-x-2">
                    <Label htmlFor="auto-login" className="flex flex-1 items-center space-x-2 text-sm">
                      <Checkbox 
                        id="auto-login" 
                        checked={autoLoginEnabled} 
                        onCheckedChange={(checked) => toggleAutoLogin(checked === true)}
                      />
                      <span>Enable Development Auto-Login</span>
                    </Label>
                    <Key className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Register a new account to get started</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
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
                              <Input placeholder="johnsmith" {...field} />
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
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>Create Account</>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-primary to-primary/50 text-primary-foreground p-12 flex-col justify-center">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-6">Building Cost Estimation Tool</h1>
          <p className="text-xl mb-6">
            A comprehensive solution for accurately estimating construction costs
            across different regions and building types.
          </p>
          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Accurate Estimates</h3>
              <p>Get precise building cost estimates based on the latest industry data.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Regional Adjustments</h3>
              <p>Automatically adjust costs based on regional factors across the country.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Project Management</h3>
              <p>Track and manage your cost estimates for multiple projects.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}