import axios from "axios";
import toast from "react-hot-toast";

// A single, unified function to handle all commands
export const processCommand = async (input, currentUser) => {
  if (!input.startsWith("/")) return null;

  const parts = input.slice(1).split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case "ai":
      const prompt = args.join(" ");
      if (!prompt) {
        toast.error("Usage: /ai [your question]");
        return null;
      }
      try {
        const { data } = await axios.post("/api/ai/ask", { prompt });
        return { type: "ai_response", content: data.reply };
      } catch (error) {
        toast.error("The AI is sleeping right now. Try again later.");
        console.error("AI command failed:", error);
        return null;
      }

    case "join":
      return {
        type: "JOIN_CHANNEL",
        payload: { channelName: args[0]?.replace("#", "") },
      };

    case "nick":
      return {
        type: "CHANGE_NICK",
        payload: { oldNick: currentUser.username, newNick: args[0] },
      };

    case "msg":
      return {
        type: "PRIVATE_MESSAGE",
        payload: { target: args[0], message: args.slice(1).join(" ") },
      };

    case "list":
      return {
        type: "LIST_CHANNELS",
        payload: {},
      };

    case "help":
      return {
        type: "SHOW_HELP",
        payload: {},
      };

    default:
      toast.error(`Command not found: /${command}`);
      return {
        type: "UNKNOWN_COMMAND",
        payload: { command },
      };
  }
};
