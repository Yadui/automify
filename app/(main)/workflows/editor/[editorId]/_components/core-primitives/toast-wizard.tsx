import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditor } from "@/providers/editor-provider";
import React, { useState } from "react";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import SmartInput from "../smart-input";
import { parseVariables } from "@/lib/utils";

const ToastWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const metadata = selectedNode.data.metadata || {};

  const [message, setMessage] = useState(metadata.message || "");
  const [type, setType] = useState(metadata.type || "success");

  const handleTest = () => {
    const parsedMessage = parseVariables(
      message || "Toast message",
      state.editor.elements
    );
    switch (type) {
      case "success":
        toast.success(parsedMessage, {
          style: {
            backgroundColor: "#ECFDF5", // Green-50
            borderColor: "#A7F3D0", // Green-200
            color: "#064E3B", // Green-900
          },
        });
        break;
      case "error":
        toast.error(parsedMessage, {
          style: {
            backgroundColor: "#FEF2F2", // Red-50
            borderColor: "#FECACA", // Red-200
            color: "#991B1B", // Red-800
          },
        });
        break;
      case "info":
        toast.info(parsedMessage, {
          style: {
            backgroundColor: "#EFF6FF", // Blue-50
            borderColor: "#BFDBFE", // Blue-200
            color: "#1E3A8A", // Blue-900
          },
        });
        break;
      case "warning":
        toast.warning(parsedMessage, {
          style: {
            backgroundColor: "#FFFBEB", // Amber-50
            borderColor: "#FDE68A", // Amber-200
            color: "#92400E", // Amber-800
          },
        });
        break;
      default:
        toast.message(parsedMessage);
    }
  };

  const handleSave = () => {
    dispatch({
      type: "UPDATE_NODE",
      payload: {
        elements: state.editor.elements.map((node) => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                configStatus: "active",
                metadata: {
                  ...node.data.metadata,
                  message,
                  type,
                  eventLabel: `Toast: ${message}`,
                },
              },
            };
          }
          return node;
        }),
      },
    });
    toast.success("Toast configured");
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Toast Message</CardTitle>
          <CardDescription>
            Display a notification in the browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Message</Label>
            <SmartInput
              value={message}
              onChange={setMessage}
              placeholder="Operation completed successfully"
            />
          </div>

          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={handleTest}
          variant="secondary"
          className="flex-1"
          disabled={!message}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Test Toast
        </Button>
        <Button onClick={handleSave} className="flex-1">
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default ToastWizard;
