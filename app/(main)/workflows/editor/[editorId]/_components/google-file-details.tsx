import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { onAddTemplate } from "@/lib/editor-utils";
import { ConnectionProviderProps } from "@/providers/connection-provider";
import React from "react";

type Props = {
  nodeConnection: ConnectionProviderProps;
  title: string;
  gFile: any;
};

type GoogleFileType = {
  kind: string;
  name: string;
  mimeType: string;
  id?: string;
};

// Define specific properties for the file data type
interface FileDataType {
  id: string;
  name: string;
  mimeType: string;
  // Add other properties as needed
}

const isGoogleFileNotEmpty = (file: GoogleFileType): boolean => {
  return Object.keys(file).length > 0 && file.kind !== "";
};

const GoogleFileDetails: React.FC<{ file: FileDataType }> = ({ file }) => {
  // Use the file data here
  return (
    <div>
      <h3>{file.name}</h3>
      <p>{file.mimeType}</p>
    </div>
  );
};

export default GoogleFileDetails;
