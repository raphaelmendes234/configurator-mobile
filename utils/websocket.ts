const PARTYKIT_URL = "wss://partykitproject.zax-pfe.partykit.dev/party/my-room";

let ws: WebSocket | null = null;
let messageQueue: string[] = [];
let isConnecting = false;

function parseMessage(raw: string): any {
  const index = raw.indexOf(": ");

  if (index === -1) return raw;

  return raw.slice(index + 2);
}

export function connect(onMessageReceived: (data: string) => void) {
  if (ws || isConnecting) return; // Évite les connexions multiples

  isConnecting = true;
  ws = new WebSocket(PARTYKIT_URL);

  ws.onopen = () => {
    console.log("Connected to PartyKit");
    // Vidage de la queue dès l'ouverture de la connexion
    messageQueue.forEach((msg) => ws?.send(msg));
    messageQueue = [];
    isConnecting = false;
  };

  ws.onmessage = (event) => {
    console.log("Message reçu :", event.data);

    const clean = parseMessage(event.data as string);

    // 💡 Ici, on appelle la fonction fournie par le composant React !
    onMessageReceived(clean);
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  ws.onclose = () => {
    console.log("Disconnected from PartyKit");
    ws = null;
    isConnecting = false;
  };
}

export function sendMessage(message: any) {
  const json = JSON.stringify(message);

  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log(json);
    ws.send(json);
    return;
  }

  // 💡 NOUVELLE LOGIQUE : Si le WS n'est pas ouvert ou est en cours de fermeture/non initialisé
  // On place le message dans la file d'attente
  messageQueue.push(json);

  console.warn(
    `WebSocket non prêt. Message mis en file d'attente (${messageQueue.length} total).`,
  );

  // Dans ce cas, nous assumons que le composant React a déjà appelé connect()
  // ou qu'il le fera bientôt. On ne l'appelle pas ici pour éviter la rupture du callback.
}

export function disconnect() {
  if (ws) {
    ws.close();
    ws = null;
    isConnecting = false;
    console.log("PartyKit déconnecté manuellement.");
  }
}
