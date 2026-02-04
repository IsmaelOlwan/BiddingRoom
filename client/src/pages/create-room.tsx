import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Upload, ArrowLeft, Loader2, X, ImageIcon } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useUpload } from "@/hooks/use-upload";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
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
import { apiRequest } from "@/lib/queryClient";

const PLANS = {
  basic: { name: "Basic", price: "$9" },
  standard: { name: "Standard", price: "$19" },
  pro: { name: "Pro", price: "$29" },
};

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
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const planType = (params.get("plan") as "basic" | "standard" | "pro") || "basic";
  const plan = PLANS[planType];
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      setUploadedImages((prev) => [...prev, response.objectPath]);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        await uploadFile(file);
      }
    }
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      email: "",
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const roomRes = await apiRequest("POST", "/api/rooms", {
        title: values.title,
        description: values.description,
        images: uploadedImages,
        deadline: values.deadline.toISOString(),
        sellerEmail: values.email,
        planType: planType,
      });
      const { room } = await roomRes.json();
      
      const checkoutRes = await apiRequest("POST", `/api/rooms/${room.id}/checkout`);
      const { url } = await checkoutRes.json();
      
      return url;
    },
    onSuccess: (checkoutUrl) => {
      window.location.href = checkoutUrl;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create room. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createRoomMutation.mutate(values);
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
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
            <span className="text-sm font-medium text-primary">{plan.name} Plan</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm font-bold text-primary">{plan.price}</span>
          </div>
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
                        <Input 
                          placeholder="e.g. 2018 Industrial CNC Machine" 
                          data-testid="input-title"
                          {...field} 
                        />
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
                          data-testid="input-description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Images (optional)</Label>
                  
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {uploadedImages.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                          <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                            data-testid={`button-remove-image-${index}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <label className="block">
                    <div className={cn(
                      "border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors",
                      isUploading && "opacity-60 pointer-events-none"
                    )}>
                      {isUploading ? (
                        <>
                          <Loader2 className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-spin" />
                          <p className="text-sm text-muted-foreground font-medium">
                            Uploading...
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-sm text-muted-foreground font-medium">
                            Click to upload images
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 10MB each
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                      data-testid="input-images"
                    />
                  </label>
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
                                data-testid="button-deadline"
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
                          <Input 
                            placeholder="you@company.com" 
                            data-testid="input-email"
                            {...field} 
                          />
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
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full md:w-auto font-bold px-8"
                    disabled={createRoomMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createRoomMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating room...
                      </>
                    ) : (
                      `Continue to Payment (${plan.price})`
                    )}
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
