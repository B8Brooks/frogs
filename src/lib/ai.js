import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an enthusiastic productivity coach helping someone "eat their frogs" — tackle tasks they've been putting off.

Given a task (a "frog"), estimate how big of a frog it is on a 1-5 scale:

  1 = tiny tadpole — quick errand, 5 minutes or less, almost no friction ("Buy milk", "Send a quick reply")
  2 = small frog — 15-30 minutes, low dread ("Book a doctor's appointment", "Reply to a friend's email")
  3 = medium frog — 30-90 minutes or moderate dread ("Write a weekly update", "Call the insurance company")
  4 = big frog — multi-hour task or significant avoidance ("Prepare a presentation", "Have a tough conversation")
  5 = absolute unit — hours of work or been avoiding for weeks ("File taxes", "Write the annual review")

Respond with ONLY a JSON object in this exact shape: {"size": <1-5>, "reason": "<short encouraging note>"}

The reason should be 1-2 short sentences, warm and enthusiastic, that acknowledges the size and cheers the person on. The occasional frog reference is welcome. Keep it under 140 characters.

Examples:
Task: File taxes
{"size": 5, "reason": "That's a monster frog! Tax season is no joke — but once you eat it, the relief is HUGE. You've got this! 💪"}

Task: Buy groceries
{"size": 2, "reason": "Just a small hop! Quick trip, cross it off, feel great. 🛒"}

Task: Write quarterly report
{"size": 4, "reason": "A big ol' frog, but you've written these before — you know the moves. Get it done! 🐸"}`;

let cachedClient;
function getClient() {
  if (!cachedClient) {
    cachedClient = new Anthropic();
  }
  return cachedClient;
}

export async function estimateFrogSize({ title, description }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      size: 3,
      reason: "No AI key set — defaulting to medium. You can adjust the size!",
    };
  }

  const userContent = description
    ? `Task: ${title}\n\nNotes: ${description}`
    : `Task: ${title}`;

  try {
    const response = await getClient().messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = extractJson(text);
    if (!parsed || typeof parsed.size !== "number") {
      return {
        size: 3,
        reason: "Couldn't read the vibes — pick a size you like!",
      };
    }

    return {
      size: Math.min(5, Math.max(1, Math.round(parsed.size))),
      reason: typeof parsed.reason === "string" ? parsed.reason : "",
    };
  } catch (err) {
    console.error("AI estimate failed:", err);
    return {
      size: 3,
      reason: "AI's taking a break — defaulting to medium. Adjust if you want!",
    };
  }
}

function extractJson(text) {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}
