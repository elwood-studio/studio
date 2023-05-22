import React from "react";
import { render, Text, Box, Newline } from 'ink';

export type MessageProps = {
  type: "error" | "success" | "info"
  text: string
}

export function Message(props:MessageProps) {
  return (
    <Box margin={0} padding={1} flexDirection="column">
      <Box><Text color="red">Error!</Text></Box>
      <Text>{props.text}</Text>
    </Box>
  );
}

export function renderMessage(props: MessageProps) {
  render(<Message {...props}/>)
}