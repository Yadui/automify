import { WorkflowFormSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { onCreateWorkflow } from "@/app/(main)/workflows/_actions/workflow-connections";
import { useModal } from "@/providers/modal-provider";

type Props = {
  title?: string;
  subTitle?: string;
  onClose?: () => void;
};

const Workflowform = ({ subTitle, title, onClose }: Props) => {
  const { setClose } = useModal();
  const form = useForm<z.infer<typeof WorkflowFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(WorkflowFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: z.infer<typeof WorkflowFormSchema>) => {
    if (isLoading) return; // Prevent double submission
    setIsLoading(true);

    try {
      // Fallback: If values are empty/partial but RHF state has them, use getValues()
      // This handles edge cases where RHF's handleSubmit argument is unexpectedly empty
      const formData = values.name ? values : form.getValues();

      console.log("Submitting with:", formData);

      const workflow = await onCreateWorkflow(
        formData.name,
        formData.description || "",
      );
      if (workflow) {
        toast.message(workflow.message);
        if (workflow.id) {
          router.push(`/workflows/editor/${workflow.id}`);
        } else {
          router.refresh();
        }
      }
      if (onClose) {
        onClose();
      } else {
        setClose();
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4 text-left"
      >
        <FormField
          disabled={isLoading}
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Workflow Name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          disabled={isLoading}
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Description (Optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-2 mt-2">
          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              "Create Workflow"
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default Workflowform;
