import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView } from "react-native";
import { askAI } from "../api/ai";

export default function AIAssistant() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setChat((c) => [...c, `You: ${userMsg}`]);
    setLoading(true);

    try {
      const { reply } = await askAI(userMsg);
      setChat((c) => [...c, `AI: ${reply}`]);
    } catch (e: any) {
      setChat((c) => [...c, `Error: ${e?.message || "Unknown error"}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ScrollView style={{ flex: 1 }}>
        {chat.map((m, i) => (
          <Text key={i} style={{ marginBottom: 8 }}>
            {m}
          </Text>
        ))}
      </ScrollView>

      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Type your question..."
        style={{ borderWidth: 1, padding: 12, marginBottom: 8 }}
      />
      <Button title={loading ? "Sending..." : "Send"} onPress={send} disabled={loading} />
    </View>
  );
}
