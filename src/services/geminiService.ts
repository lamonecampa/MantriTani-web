export async function diagnosePlant(text: string, imageData?: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, image: imageData }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal berkomunikasi dengan Mantri AI. Hubungi PPL atau cek koneksi internet.");
  }

  const data = await response.json();
  return data.text;
}

export async function startChat() {
  // Let the server-side API handle the context automatically
  return {
    sendMessage: async (msg: { message: string }) => {
      const response = await diagnosePlant(msg.message);
      return { text: response };
    }
  };
}
