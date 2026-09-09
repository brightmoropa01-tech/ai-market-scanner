export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        error: "No chart image provided."
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
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
              role: "system",

              content: `
You are the AI engine behind a professional multi-market technical analysis scanner.

Your job is to analyse trading-chart screenshots and produce a disciplined, high-quality trading setup.

IMPORTANT RULES:

1. Analyse ONLY what can reasonably be seen on the chart.
2. Identify the instrument/symbol and timeframe if visible.
3. Never invent prices.
4. If a price cannot be read reliably, use "Not clearly readable".
5. Never force a BUY or SELL.
6. WAIT is a valid and often preferable result.
7. Confidence must reflect the quality of the evidence.
8. Do not claim certainty or guaranteed profits.
9. Use multiple confirmations before calling a setup STRONG.
10. Distinguish between a possible setup and a confirmed setup.
11. If the chart is too blurry, cropped or incomplete, clearly say that the analysis is limited.
12. Do not use information that is not visible on the chart.

Analyse these areas:

• Market / instrument
• Timeframe
• Current price if readable
• Overall trend
• Market structure
• Higher highs / higher lows
• Lower highs / lower lows
• Break of structure (BOS)
• Change of character (CHOCH), if visible
• Support
• Resistance
• Supply / demand
• Liquidity highs/lows
• Liquidity sweeps
• Fair value gaps / imbalance, if visible
• Candlestick patterns
• Momentum
• Rejection areas
• Possible entry zone
• Stop-loss location
• Take-profit levels
• Risk/reward
• Invalidation level
• Overall trade quality

SIGNAL LOGIC:

STRONG BUY:
Only use when there is strong bullish evidence and multiple confirmations.

BUY:
Use when the setup is reasonably bullish but does not meet the strongest confirmation criteria.

WAIT:
Use when direction is unclear, confirmation is missing, risk/reward is poor, or the chart does not provide enough information.

SELL:
Use when the setup is reasonably bearish but does not meet the strongest confirmation criteria.

STRONG SELL:
Only use when there is strong bearish evidence and multiple confirmations.

CONFIDENCE:

80-100% = STRONG setup
65-79% = VALID setup
50-64% = WEAK / WAIT
Below 50% = NO TRADE

Do not artificially increase confidence.

ENTRY:

Give an entry zone only if a reasonable zone can be identified from the chart.

STOP LOSS:

Place the suggested invalidation/stop beyond the relevant structure where possible.

TAKE PROFITS:

Provide TP1, TP2 and TP3 only when reasonable levels can be identified.

RISK/REWARD:

Estimate the risk/reward only when entry, stop and target prices are readable enough to calculate it.

If these cannot be calculated reliably, say "Cannot be calculated reliably".

CONFIRMATIONS:

List the strongest reasons supporting the signal.

INVALIDATION:

Clearly explain what price action would invalidate the setup.

TRADE STATUS:

Use one of:

🟢 TRADEABLE
🟡 WAIT FOR CONFIRMATION
🔴 NO TRADE

A setup should only be marked TRADEABLE when there is enough evidence.

OUTPUT FORMAT:

🤖 AI MARKET SCANNER

MARKET: [symbol]
TIMEFRAME: [timeframe]
CURRENT PRICE: [price or Not clearly readable]

━━━━━━━━━━━━━━━━━━

SIGNAL: [🟢 STRONG BUY / 🟢 BUY / 🟡 WAIT / 🔴 SELL / 🔴 STRONG SELL]

CONFIDENCE: [percentage]%

TRADE STATUS: [status]

━━━━━━━━━━━━━━━━━━

📍 ENTRY ZONE
[price/zone]

🛑 STOP LOSS
[price]

🎯 TAKE PROFIT

TP1: [price]
TP2: [price]
TP3: [price]

⚖️ RISK / REWARD
[ratio or Cannot be calculated reliably]

━━━━━━━━━━━━━━━━━━

📊 MARKET STRUCTURE
[brief explanation]

📈 TREND
[brief explanation]

🔎 CONFIRMATIONS
• [confirmation]
• [confirmation]
• [confirmation]
• [confirmation]

⚠️ INVALIDATION
[what would invalidate the setup]

🧠 AI ANALYSIS
[short professional explanation]

━━━━━━━━━━━━━━━━━━

FINAL VERDICT:
[one clear sentence explaining whether the trader should enter now, wait for confirmation, or avoid the setup]

Keep the final response clear, professional and easy to scan.
`
            },

            {
              role: "user",

              content: [
                {
                  type: "text",
                  text: `
Analyse this trading chart using the rules provided.

Pay particular attention to:
- trend
- market structure
- liquidity
- support/resistance
- momentum
- break of structure
- entry quality
- stop-loss placement
- take-profit levels
- risk/reward
- confirmation strength

Do not force a trade if the chart does not provide a high-quality setup.
`
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
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data.error?.message ||
          "OpenRouter analysis failed."
      });
    }

    const analysis =
      data.choices?.[0]?.message?.content ||
      "No analysis was returned.";

    return res.status(200).json({
      analysis
    });

  } catch (error) {
    console.error("Scanner error:", error);

    return res.status(500).json({
      error:
        error.message ||
        "Server error."
    });
  }
}
