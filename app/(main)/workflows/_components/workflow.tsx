"use client";

import React, { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { onFlowPublish } from "../_actions/workflow-connections";

type Props = {
  name: string;
  description: string;
  id: string;
  publish: boolean | null;
};

const Workflow = ({ description, id, name, publish }: Props) => {
  // Manage local state for `isPublished`
  const [isPublished, setIsPublished] = useState<boolean>(publish ?? false);

  const handlePublishChange = async (isChecked: boolean) => {
    const response = await onFlowPublish(id, isChecked);

    if (response) {
      toast.message(response);

      // Update the state based on the success response
      setIsPublished(isChecked);
    } else {
      // Optionally revert the toggle if the operation failed
      toast.error("Failed to update the workflow state");
    }
  };

  return (
    <Card className="flex w-full items-center justify-between gap-4">
      <CardHeader className="flex flex-col gap-4">
        <Link href={`/workflows/editor/${id}`}>
          <div className="flex flex-row gap-2">
            <Image
              src="/googleDrive.png"
              alt="Google Drive"
              height={30}
              width={30}
              className="object-contain"
            />
            <Image
              src="/notion.png"
              alt="Notion"
              height={30}
              width={30}
              className="object-contain"
            />
            <Image
              src="/discord.png"
              alt="Discord"
              height={30}
              width={30}
              className="object-contain"
            />
            <Image
              src="/slack.png"
              alt="Slack"
              height={30}
              width={30}
              className="object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </Link>
      </CardHeader>
      <div className="flex flex-col items-center gap-2 p-4">
        <Label htmlFor={`switch-${id}`} className="text-muted-foreground">
          {isPublished ? "On" : "Off"}
        </Label>
        <Switch
          id={`switch-${id}`} // Unique ID for accessibility
          onCheckedChange={handlePublishChange} // Handles toggle changes
          checked={isPublished} // Reflects the current state
        />
      </div>
    </Card>
  );
};

export default Workflow;
