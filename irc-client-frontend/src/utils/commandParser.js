export const parseCommand = (input, currentUser, currentChannel) => {
  if (!input.startsWith("/")) return null;

  const parts = input.slice(1).split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case "join":
      return {
        type: "JOIN_CHANNEL",
        channelName: args[0]?.replace("#", ""),
        payload: { channelName: args[0]?.replace("#", "") },
      };

    case "nick":
      return {
        type: "CHANGE_NICK",
        newNick: args[0],
        payload: { oldNick: currentUser.username, newNick: args[0] },
      };

    case "msg":
      return {
        type: "PRIVATE_MESSAGE",
        target: args[0],
        message: args.slice(1).join(" "),
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
      return {
        type: "UNKNOWN_COMMAND",
        command,
        payload: { command },
      };
  }
};
