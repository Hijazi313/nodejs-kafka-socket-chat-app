"use client";
import { useState } from "react";
import { useSocket } from "../context/SocketProvider";
import classes from "./page.module.css";

export default function Page() {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");
console.log(messages)
  return (
    <>
      <div>
        <h1>Messages will appear here</h1>
      </div>
      <div>
        <input
          placeholder="Message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={classes["chat-input"]}
        />
        <button
          className={classes["button"]}
          onClick={() => sendMessage(message)}
        >
          Send
        </button>
      </div>
      <div>
        {messages.map((msg,i) => (
          <li key={i} >{msg}</li>
        ))}
      </div>
    </>
  );
}
