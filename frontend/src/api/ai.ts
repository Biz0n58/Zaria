const BASE_URL = "http://YOUR_LAPTOP_IP:8080";

export async function askAI(message: string) {
  const res = await fetch(`${BASE_URL}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "AI request failed");
  }

  return res.json() as Promise<{ reply: string }>;
}
