import { useState, useRef } from "react";
import { Upload, X, Image } from "lucide-react";
import useStore from "../../store/useStore";
import { uploadAPI } from "../../services/api";
import toast from "react-hot-toast";
import ImageDropzone from "./ImageDropzone";

const FileUpload = ({ onFileUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { currentChannel, socket, user } = useStore();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    if (!currentChannel || !socket) {
      toast.error("Please select a channel first");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only image files are allowed");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadAPI.uploadFile(formData);

      // Send file message via socket
      socket.emit("send-message", {
        channelId: currentChannel._id,
        content: file.name,
        messageType: "file",
        fileUrl: response.data.file.url,
        fileName: response.data.file.originalName,
      });

      toast.success("File uploaded successfully!");
      if (onFileUploaded) onFileUploaded();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4">
      <ImageDropzone />
    </div>
  );
};

export default FileUpload;
