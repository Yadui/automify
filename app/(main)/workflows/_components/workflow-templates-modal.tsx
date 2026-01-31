"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Upload,
  FileJson,
  Mail,
  MessageSquare,
  Globe,
  HardDrive,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  onImportWorkflow,
  onCreateFromTemplate,
  getWorkflowTemplates,
} from "../_actions/workflow-connections";

const iconMap: Record<string, React.ReactNode> = {
  Mail: <Mail className="w-5 h-5" />,
  MessageSquare: <MessageSquare className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  HardDrive: <HardDrive className="w-5 h-5" />,
};

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: string[];
}

export default function WorkflowTemplatesModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTemplates = async () => {
    const data = await getWorkflowTemplates();
    setTemplates(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      loadTemplates();
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const result = await onImportWorkflow(data);
      if (result.success) {
        toast.success(`Workflow "${result.name}" imported successfully!`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to import workflow");
      }
    } catch (error) {
      toast.error("Invalid JSON file. Please check the file format.");
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    setLoadingTemplateId(templateId);
    try {
      const result = await onCreateFromTemplate(templateId);
      if (result.success) {
        toast.success(`Workflow "${result.name}" created from template!`);
        setOpen(false);
        router.push(`/workflows/editor/${result.workflowId}`);
      } else {
        toast.error(result.error || "Failed to create workflow from template");
      }
    } catch (error) {
      toast.error("An error occurred while creating the workflow");
    } finally {
      setLoadingTemplateId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Templates & Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Quick Start
          </DialogTitle>
          <DialogDescription>
            Start from a template or import an existing workflow
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors group"
                  onClick={() => handleCreateFromTemplate(template.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {iconMap[template.icon] || (
                          <Sparkles className="w-5 h-5" />
                        )}
                      </span>
                      {loadingTemplateId === template.id ? (
                        <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                      ) : null}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="font-medium text-sm">{template.name}</p>
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {template.description}
                    </CardDescription>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {template.nodes.map((node, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] rounded"
                        >
                          {node}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="import" className="mt-4">
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileJson className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Import Workflow</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                    Upload a JSON file exported from Automify to restore a
                    workflow
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    onClick={handleImportClick}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {isLoading ? "Importing..." : "Choose File"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
