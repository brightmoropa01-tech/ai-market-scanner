export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No chart image provided." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://ai-market-scanner-five.vercel.app/",
        "X-Title": "AI Market Scanner"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an experienced technical market analyst.

Analyse the trading chart in the image.

Identify the market/instrument if visible and analyse:
1. Market direction and trend
2. Market structure
3. Support and resistance
4. Important candlestick/chart patterns
5. Possible entry area
6. Stop-loss area
7. Take-profit areas
8. Risk/reward considerations
9. Whether the setup is BUY, SELL, or WAIT
10. Confidence level and reasons

Do not invent prices that cannot reasonably be read from the chart.
If the chart is unclear, say so.
This is educational market analysis, not guaranteed financial advice.

Return a clear, easy-to-read analysis.`
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenRouter analysis failed."
      });
    }

    return res.status(200).json({
      analysis:
        data.choices?.[0]?.message?.content ||
        "No analysis was returned."
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error."
    });
  }
}
