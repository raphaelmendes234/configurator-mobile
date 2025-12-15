import React, { JSX, useEffect, useRef, useState } from "react";
import { Button, Text, View } from "react-native";

export default function PartyKitExample(): JSX.Element {
    const ws = useRef<WebSocket | null>(null);

    const [status, setStatus] = useState<"Connected" | "Disconnected">( "Disconnected");
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        const url = "wss://partykitproject.zax-pfe.partykit.dev/party/my-room"; 

        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
            setStatus("Connected");
            console.log("Connected to PartyKit");
        };

        ws.current.onmessage = (event: WebSocketMessageEvent) => {
            const msg = event.data as string;
            console.log("Message reçu :", msg);
            setMessages((prev) => [...prev, msg]);
        };

        ws.current.onerror = (err) => {
            console.error("WebSocket error :", err);
        };

        ws.current.onclose = () => {
            setStatus("Disconnected");
            console.log("Disconnected from PartyKit");
        };

        return () => {
            ws.current?.close();
        };
    }, []);

    const sendMessage = () => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const message = "Hello test from expo"
            ws.current.send(message);
            console.log(`Message envoyé : ${message}`);
        }
    };

    return (
        <View style={{ padding: 20, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Text style={{color: "white"}}>Status : {status}</Text>
            <Button title="Envoyer un message" onPress={sendMessage} />
        </View>
    );
}
