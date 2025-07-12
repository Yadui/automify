// "use client";

// import React from "react";
// import { FileUploaderRegular } from "@uploadcare/react-uploader/next";
// import "@uploadcare/react-uploader/core.css";
// import { useRouter } from "next/navigation";

// // Define a specific type for props instead of using any
// interface UploadCareButtonProps {
//   onUpload: (url: string) => void; // Callback with string URL parameter
//   className?: string; // Optional className for styling
// }

// // Define the type for the state parameter
// interface UploadState {
//   successEntries?: { cdnUrl: string }[]; // Adjust the structure based on your actual data
// }

// // Update the component to use the defined props type
// const UploadCareButton: React.FC<UploadCareButtonProps> = ({ onUpload }) => {
//   // Remove unused props warning by using props or destructuring
//   // const { someProp } = props; // Example if you have props to use

//   const router = useRouter();

//   const handleUploadComplete = (state: UploadState) => {
//     // Check for the first successful file upload entry
//     const firstFile = state?.successEntries?.[0];
//     if (firstFile && firstFile.cdnUrl) {
//       onUpload(firstFile.cdnUrl); // Pass the cdnUrl to the onUpload function
//       router.refresh(); // Refresh the page
//     } else {
//       console.error("No file uploaded or cdnUrl missing");
//     }
//   };

//   return (
//     <div>
//       <FileUploaderRegular
//         sourceList="local, url, camera, dropbox"
//         classNameUploader="uc-dark"
//         pubkey="6d5e5db504fa35298f9c" // Replace with your public key
//         onChange={handleUploadComplete} // Call the handler with the state
//       />
//     </div>
//   );
// };

// export default UploadCareButton;
