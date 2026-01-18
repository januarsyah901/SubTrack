import { GoogleGenerativeAI } from "@google/generative-ai";
import { Subscription, InsightReport } from "../models/types.js";
import { config } from "../config/index.js";

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export class GeminiService {
  static async getSubscriptionInsights(
    subscriptions: Subscription[],
  ): Promise<InsightReport> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const monthlyTotal = subscriptions.reduce((acc, sub) => {
        return acc + (sub.cycle === "MONTHLY" ? sub.amount : sub.amount / 12);
      }, 0);

      const prompt = `
You are a financial advisor analyzing subscription spending. Provide insights for the following subscriptions:

${subscriptions.map((s) => `- ${s.name}: $${s.amount}/${s.cycle.toLowerCase()} (Category: ${s.category})`).join("\n")}

Monthly Total: $${monthlyTotal.toFixed(2)}

Provide:
1. A brief summary (1-2 sentences) about their subscription spending
2. 3 specific savings opportunities

Format your response as JSON with keys: "summary" (string) and "savingsOpportunities" (array of 3 strings)
Only respond with valid JSON, no markdown formatting.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      try {
        const parsed = JSON.parse(responseText);
        return {
          summary: parsed.summary || "Your subscriptions are well managed.",
          savingsOpportunities: Array.isArray(parsed.savingsOpportunities)
            ? parsed.savingsOpportunities.slice(0, 3)
            : [
                "Review unused subscriptions",
                "Consider annual plans for discounts",
                "Bundle services when possible",
              ],
          totalProjected: monthlyTotal * 12,
        };
      } catch {
        // Fallback if JSON parsing fails
        return {
          summary:
            "Your subscriptions are under active review. Total: $" +
            monthlyTotal.toFixed(2) +
            "/month",
          savingsOpportunities: [
            "Review subscriptions you rarely use",
            "Look for annual billing discounts",
            "Consider bundled service packages",
          ],
          totalProjected: monthlyTotal * 12,
        };
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("Failed to generate insights");
    }
  }

  static async parseSmartAdd(
    input: string,
  ): Promise<Partial<Subscription> | null> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
Parse this subscription input: "${input}"

Extract and return as JSON:
{
  "name": "service name",
  "amount": number (price),
  "billingDate": number (day of month, 1-31, or null to use 1),
  "cycle": "MONTHLY" or "YEARLY",
  "category": "category name"
}

Only return valid JSON, nothing else.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      return JSON.parse(responseText);
    } catch (error) {
      console.error("Gemini parse error:", error);
      return null;
    }
  }
}
