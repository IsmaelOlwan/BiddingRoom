import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Upload, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  deadline: z.date({
    required_error: "A deadline is required.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export default function CreateRoomPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, this would send data to the backend
    console.log(values);
    toast({
      title: "Room Created",
      description: "Redirecting to payment...",
    });
    // Simulate redirection to payment
    setTimeout(() => {
      // For now, we'll just show a success state or go back home
      // In a real flow, this would go to Stripe/Checkout
      setLocation("/"); 
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Create your bidding room
          </h1>
          <p className="mt-2 text-muted-foreground">
            Fill in the details below to set up your private sales environment.
          </p>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
            <CardDescription>
              Provide clear information to attract the right buyers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 2018 Industrial CNC Machine" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear, descriptive title for your asset.
                      </FormDescription>
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
                          placeholder="Describe the condition, specifications, and includes..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Images (Max 5-8)</FormLabel>
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:bg-secondary/50 transition-colors cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 10MB each
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Bidding Deadline</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Bidding closes at midnight on this date.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seller Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@company.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Where you'll receive bid notifications.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-6 border-t border-border">
                  <Button type="submit" size="lg" className="w-full md:w-auto font-bold px-8">
                    Continue to Payment
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
