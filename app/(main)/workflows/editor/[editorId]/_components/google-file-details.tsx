import React from "react";

// Define specific properties for the file data type
interface FileDataType {
  id: string;
  name: string;
  mimeType: string;
  // Add other properties as needed
}

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
