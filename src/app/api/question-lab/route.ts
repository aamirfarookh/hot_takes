import { NextRequest, NextResponse } from "next/server";
import {
  analyzeQuestionHeuristically,
  CLOTHING_SUSTAINABILITY_DEMO_QUESTION,
} from "@/lib/questionLabFallback";
import type { QuestionAnalysisResult } from "@/types/question-lab";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const questionText = (body.question || "").trim();

    if (!questionText) {
      return NextResponse.json(
        { error: "Question text is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key is provided, use high-fidelity heuristic fallback
    if (!apiKey) {
      const fallbackResult = analyzeQuestionHeuristically(questionText);
      return NextResponse.json(fallbackResult, { status: 200 });
    }

    // Call Gemini API with strict JSON schema instructions
    const prompt = `
You are an expert psychometrician, behavioral economist, and survey methodologist at Hot Takes.
Analyze this conventional survey question for research vulnerabilities and design a gamified revealed-preference redesign.

Target Question:
"${questionText}"

Respond ONLY with valid JSON conforming strictly to this schema:
{
  "originalQuestion": "${questionText}",
  "overallRiskScore": <number between 0 and 100>,
  "biasFlags": [
    {
      "flag": "leading_wording" | "social_desirability_risk" | "double_barrelled" | "abstract_unanchored" | "predictable_pattern_risk",
      "displayName": "<User friendly name>",
      "severity": <integer 0 to 3>,
      "explanation": "<Specific diagnostic rationale>",
      "mitigation": "<Actionable fix>"
    }
  ],
  "recommendedFormat": {
    "format": "trade_off_budget_allocation" | "forced_choice" | "scenario" | "ranking" | "implicit_association" | "likert",
    "displayName": "<User friendly name of mechanic>",
    "rationale": "<Why this format eliminates the identified biases>"
  },
  "redesignedConcept": {
    "title": "<Catchy gamified title>",
    "behaviouralVersion": "<The actual framing and prompt the participant sees>",
    "gamifiedMechanic": "<Step by step game mechanic with budget, items, trade-offs, and disruptions>",
    "participantTimeEstimate": "<e.g. 2 - 3 minutes>",
    "primaryBehavioralMetric": "<What is calculated to measure true revealed preference>"
  },
  "constructPreservation": {
    "isPreserved": <boolean true or false>,
    "constructBeingMeasured": "<The core latent construct>",
    "analysis": "<Detailed proof that the redesigned game still measures what the original intended to measure>",
    "tradeOffs": "<Participant time / cognitive friction trade-offs>",
    "fidelityScore": <integer 0 to 100>
  }
}
`;

    // Try Gemini API models
    const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
    let apiSuccess = false;
    let parsedData: QuestionAnalysisResult | null = null;

    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
              },
            }),
            signal: AbortSignal.timeout(8000), // 8s timeout
          }
        );

        if (res.ok) {
          const geminiData = await res.json();
          const candidateText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const raw = JSON.parse(candidateText);
            // Validate basic required fields
            if (raw.biasFlags && raw.recommendedFormat && raw.redesignedConcept) {
              parsedData = {
                ...raw,
                originalQuestion: questionText,
                isHeuristicFallback: false,
              };
              apiSuccess = true;
              break;
            }
          }
        }
      } catch (err) {
        console.warn(`[Gemini API call to ${model} failed, checking fallback]`, err);
      }
    }

    if (apiSuccess && parsedData) {
      return NextResponse.json(parsedData, { status: 200 });
    }

    // Heuristic fallback if API failed or timed out
    const fallback = analyzeQuestionHeuristically(questionText);
    return NextResponse.json(fallback, { status: 200 });
  } catch (error) {
    console.error("[Question Lab API fatal error]", error);
    // Even on fatal server error, return safe heuristic fallback
    const fallback = analyzeQuestionHeuristically(CLOTHING_SUSTAINABILITY_DEMO_QUESTION);
    return NextResponse.json(fallback, { status: 200 });
  }
}
