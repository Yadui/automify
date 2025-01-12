"use client";

import React from "react";
import { FileUploaderRegular } from "@uploadcare/react-uploader/next";
import "@uploadcare/react-uploader/core.css";
import { useRouter } from "next/navigation";

type Props = {
  onUpload: (url: string) => void;
};

const UploadCareButton = ({ onUpload }: Props) => {
  const router = useRouter();

  const handleUploadComplete = (state: any) => {
    // Check for the first successful file upload entry
    const firstFile = state?.successEntries?.[0];
    if (firstFile && firstFile.cdnUrl) {
      onUpload(firstFile.cdnUrl); // Pass the cdnUrl to the onUpload function
      router.refresh(); // Refresh the page
    } else {
      console.error("No file uploaded or cdnUrl missing");
    }
  };

  return (
    <div>
      <FileUploaderRegular
        sourceList="local, url, camera, dropbox"
        classNameUploader="uc-dark"
        pubkey="6d5e5db504fa35298f9c" // Replace with your public key
        onChange={handleUploadComplete} // Call the handler with the state
      />
    </div>
  );
};

export default UploadCareButton;
