import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an enthusiastic productivity coach helping someone "eat their frogs" — tackle tasks they've been putting off.

Given a task (a "frog"), you do TWO things:

1. ESTIMATE SIZE on a 1-5 scale:
  1 = tiny tadpole — quick errand, 5 min or less ("Buy milk", "Send a quick reply")
  2 = small frog — 15-30 min, low dread ("Book a doctor's appointment")
  3 = medium frog — 30-90 min or moderate dread ("Write a weekly update")
  4 = big frog — multi-hour or significant avoidance ("Prepare a presentation")
  5 = absolute unit — hours of work or been avoiding for weeks ("File taxes")

2. CATEGORIZE into a bucket. Pick the BEST category name for this kind of task. Use short, clear names like:
  - "Household" (laundry, dishes, cleaning, repairs, trash)
  - "Health & Fitness" (workouts, doctor visits, meal prep)
  - "Finance" (taxes, bills, budgeting, insurance)
  - "Work" (reports, meetings, presentations, emails to colleagues)
  - "Travel" (booking flights, reservations, packing)
  - "Personal" (haircut, phone calls to friends/family)
  - "Shopping" (groceries, gifts, returns)
  - "Admin" (paperwork, registrations, renewals)

If the user already has existing buckets, prefer matching to one of those over creating a new one. Only suggest a new bucket if none of the existing ones fit.

Respond with ONLY a JSON object: {"size": <1-5>, "reason": "<short encouraging note under 140 chars>", "bucket": "<category name>"}

The reason should be warm, enthusiastic, and acknowledge the frog's size. Keep it playful.

Examples:
Task: File taxes
{"size": 5, "reason": "Monster frog! But once you eat it, the relief is HUGE. You've got this! 💪", "bucket": "Finance"}

Task: Do the laundry
{"size": 2, "reason": "Quick hop — toss it in, forget it, done! 🧺", "bucket": "Household"}

Task: Book flight to Denver
{"size": 3, "reason": "A medium frog — compare a few options and lock it in! ✈️", "bucket": "Travel"}`;

let cachedClient;
function getClient() {
  if (!cachedClient) {
    cachedClient = new Anthropic();
  }
  return cachedClient;
}

export async function estimateFrogSize({ title, description, existingBuckets }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      size: 3,
      reason: "No AI key set — defaulting to medium. You can adjust the size!",
      bucket: null,
    };
  }

  let userContent = description
    ? `Task: ${title}\n\nNotes: ${description}`
    : `Task: ${title}`;

  if (existingBuckets && existingBuckets.length > 0) {
    userContent += `\n\nExisting buckets the user already has: ${existingBuckets.join(", ")}`;
  }

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
        bucket: null,
      };
    }

    return {
      size: Math.min(5, Math.max(1, Math.round(parsed.size))),
      reason: typeof parsed.reason === "string" ? parsed.reason : "",
      bucket: typeof parsed.bucket === "string" ? parsed.bucket.trim() : null,
    };
  } catch (err) {
    console.error("AI estimate failed:", err);
    return {
      size: 3,
      reason: "AI's taking a break — defaulting to medium. Adjust if you want!",
      bucket: null,
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
