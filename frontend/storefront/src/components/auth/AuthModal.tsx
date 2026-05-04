// components/Auth/AuthModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Combined schema (all fields optional, validated conditionally)
const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = z.infer<typeof authSchema>;

const AuthModal = () => {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    authReason,
    login,
    signup,
    postLoginRedirect,
    setPostLoginRedirect,
  } = useAuth();

  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Local mode state to allow toggling inside the modal
  const [mode, setMode] = useState<"login" | "signup">(authModalMode);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  // Keep local mode in sync with context mode (when modal opens)
  useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode, authModalOpen]);

  // Reset form and error when modal closes
  useEffect(() => {
    if (!authModalOpen) {
      form.reset();
      setError("");
    }
  }, [authModalOpen, form]);

  // Reset form when mode changes inside the modal
  useEffect(() => {
    // Clear fields when switching mode
    form.reset();
    setError("");
  }, [mode, form]);

  const onSubmit = async (values: AuthFormValues) => {
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(values.email, values.password);

        // ✅ Handle redirect after successful login
        const redirectTo = postLoginRedirect || "/dashboard";
        navigate(redirectTo);
        setPostLoginRedirect(null);

        toast({
          title: "Welcome back!",
          description: "You're now signed in.",
        });
        closeAuthModal();

        // Modal closes automatically because login() calls closeAuthModal()
      } else {
        // Signup logic remains unchanged
        if (!values.name) throw new Error("Name is required");

        const result = await signup(values.name, values.email, values.password);

        // If signup succeeded
        if (result.success) {
          toast({
            title: "Account created!",
            description: result.message || "Please log in to continue.",
          });

          // Switch to login mode and clear form
          setMode("login");
          form.reset();
        } else {
          throw new Error(result.message);
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");

      toast({
        title: "Error",
        description: err.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={closeAuthModal}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {mode === "login" ? "Welcome Back!" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {authReason
              ? authReason
              : mode === "login"
                ? "Sign in to access your account and continue shopping"
                : "Join us to unlock exclusive deals and track your orders"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === "signup" && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm mt-4">
          {mode === "login" ? (
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-medium"
                onClick={() => setMode("signup")}
              >
                Sign Up
              </Button>
            </p>
          ) : (
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-medium"
                onClick={() => setMode("login")}
              >
                Sign In
              </Button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
