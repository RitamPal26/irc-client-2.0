import { useState } from "react";
import { Image, Upload } from "lucide-react";
import useStore from "../../store/useStore";
import { uploadAPI } from "../../services/api";
import toast from "react-hot-toast";

const SimpleImageUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { currentChannel, socket, user } = useStore();

  const handleFileUpload = async (file) => {
    if (!file || !currentChannel || !socket) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
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

      socket.emit("send-message", {
        channelId: currentChannel._id,
        content: file.name,
        messageType: "file",
        fileUrl: response.data.file.url,
        fileName: file.name,
      });

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
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

  return (
    <div className="p-4">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-blue-500 bg-blue-50 text-blue-600"
            : "border-gray-600 text-gray-400 hover:border-gray-500"
        } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p>Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Image className="h-12 w-12 mb-3" />
            {isDragging ? (
              <p className="text-lg font-medium">Drop image here!</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Drop image here or click to select
                </p>
                <p className="text-sm">
                  Supports: JPG, PNG, GIF, WebP (max 5MB)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleImageUpload;
