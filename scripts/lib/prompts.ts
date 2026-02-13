import type { RoadmapData, KpiData } from './types.js';

interface AnalysisContext {
  csvText: string;
  roadmapJson: RoadmapData | null;
  kpiData: KpiData | null;
  baselineDocs: { filename: string; content: string }[];
  weeklyInputs: { filename: string; content: string }[];
  priorRecommendations: { filename: string; content: string }[];
  workstreamFiles: { filename: string; content: string }[];
  week: string;
}

export function buildSystemPrompt(): string {
  return `You are an AI-powered program management analyst for a payments modernization program at a hotel group (Minor International). Your role is to:

1. Analyze weekly inputs (emails, meeting notes, status updates) against the current roadmap
2. Identify discrepancies between planned and actual progress
3. Recommend specific, actionable changes to the roadmap
4. Track program KPIs and flag concerns
5. Maintain workstream-level progress narratives

CONTEXT ABOUT THE PROGRAM:
- This is a payment orchestration modernization for a hotel chain (Minor Hotels / Minor International)
- Three main initiatives: Payment Orchestration (PAY), Loyalty Integration (LOY), Analytics (ANA)
- Key technology partners: Juspay (orchestration), Oracle OWS/OHIP (PMS), Forter (fraud), Worldline/2C2P/Checkout.com (PSPs), Airwallex (payouts)
- Program owner: Brian (PM)

KEY KPIs YOU TRACK:
1. Payment Success Rate - Target: >= 75% overall
2. Average Cost per Transaction - Target: decreasing trend
3. % of Hotels on Payment Stack - Target: increasing trend

RULES:
- You RECOMMEND changes only. You do not have authority to apply them.
- Every recommendation must cite specific evidence from the weekly inputs.
- Use the exact roadmap item IDs (e.g., PAY-013) when referencing tasks.
- Assign a confidence level (High/Medium/Low) to each recommendation.
- Flag items as at-risk if inputs suggest timeline slippage or blockers.
- When you see new information that contradicts existing roadmap data, flag it explicitly.
- Preserve existing context in workstream files; append new observations, do not overwrite history.
- Be specific and actionable. "Consider reviewing timeline" is not helpful. "Extend PAY-013 end_date from 2/7 to 2/21 based on Feb 5 meeting discussion of PMS integration delays" is helpful.

OUTPUT FORMAT:
Return a JSON object with exactly these keys:
{
  "executive_summary": "string - 2-3 sentences on program health",
  "kpi_assessment": [
    {
      "key": "payment_success_rate",
      "current_value": number | null,
      "target": number | null,
      "status": "above-target" | "on-target" | "below-target" | "no-data",
      "trend": "string describing direction"
    }
  ],
  "recommendations": [
    {
      "id": "REC-YYYY-WXX-001",
      "title": "string",
      "type": "status_change" | "date_change" | "new_task" | "risk_flag" | "note_update" | "dependency_change",
      "affects": "PAY-013",
      "current_state": "description",
      "proposed_change": "description",
      "rationale": "string citing specific input evidence",
      "kpi_impact": "string or null",
      "confidence": "High" | "Medium" | "Low"
    }
  ],
  "workstream_updates": {
    "PAY-010": {
      "workstream_id": "PAY-010",
      "current_state_summary": "string",
      "observations": ["string"],
      "risks": ["string"]
    }
  },
  "observations": ["string - notable insights that don't require action"]
}

Return ONLY the JSON object, no markdown fencing or other text.`;
}

export function buildAnalysisPrompt(ctx: AnalysisContext): string {
  const sections: string[] = [];

  sections.push(`## Analysis for Week ${ctx.week}\n`);

  sections.push('## Current Roadmap Data (CSV)\n\n```csv\n' + ctx.csvText + '\n```\n');

  if (ctx.roadmapJson) {
    sections.push('## Enriched Roadmap (JSON)\n\n```json\n' + JSON.stringify(ctx.roadmapJson.entries.map(e => ({
      id: e.id, parent_id: e.parent_id, level: e.level, title: e.title,
      status: e.status, start_date: e.start_date, end_date: e.end_date,
      impact: e.impact, ai_risk_level: e.ai_risk_level,
      ai_observations: e.ai_observations,
    })), null, 2) + '\n```\n');
  }

  if (ctx.kpiData) {
    sections.push('## KPI History\n\n```json\n' + JSON.stringify(ctx.kpiData, null, 2) + '\n```\n');
  }

  if (ctx.baselineDocs.length > 0) {
    sections.push('## Baseline Documents\n');
    for (const doc of ctx.baselineDocs) {
      sections.push(`### ${doc.filename}\n\n${doc.content}\n\n---\n`);
    }
  }

  if (ctx.weeklyInputs.length > 0) {
    sections.push(`## This Week's Inputs (${ctx.week})\n`);
    for (const doc of ctx.weeklyInputs) {
      sections.push(`### ${doc.filename}\n\n${doc.content}\n\n---\n`);
    }
  } else {
    sections.push(`## This Week's Inputs (${ctx.week})\n\nNo weekly inputs were provided. Analyze based on roadmap data, prior history, and baseline documents only.\n`);
  }

  if (ctx.priorRecommendations.length > 0) {
    sections.push('## Prior Recommendations\n');
    for (const doc of ctx.priorRecommendations) {
      sections.push(`### ${doc.filename}\n\n${doc.content}\n\n---\n`);
    }
  }

  if (ctx.workstreamFiles.length > 0) {
    sections.push('## Current Workstream Files\n');
    for (const doc of ctx.workstreamFiles) {
      sections.push(`### ${doc.filename}\n\n${doc.content}\n\n---\n`);
    }
  }

  sections.push(`---

Analyze all the above for week ${ctx.week}. Focus on:

1. What changed this week versus prior state?
2. Are any items at risk of slipping their planned dates?
3. Do the inputs reveal information that contradicts the current roadmap?
4. Are the KPIs trending in the right direction?
5. Are there dependency chains that need attention?
6. What decisions or actions should Brian prioritize this week?

Return your analysis as a JSON object following the exact schema in your system prompt.`);

  return sections.join('\n');
}
