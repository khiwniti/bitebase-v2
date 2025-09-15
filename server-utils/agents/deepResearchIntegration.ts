/**
 * Deep Research Integration for Market Research Agents
 * Adapts DeepAgents research capabilities to TypeScript/Node.js environment
 */

import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { searchWeb, searchPlaces, withRetry } from "../lib/externalAPIs";

// Deep Research Configuration
export interface DeepResearchConfig {
  maxSearchQueries: number;
  searchDepth: "basic" | "comprehensive" | "expert";
  researchDomains: string[];
  synthesisModel: string;
  compressionModel: string;
}

export const DEFAULT_DEEP_RESEARCH_CONFIG: DeepResearchConfig = {
  maxSearchQueries: 10,
  searchDepth: "comprehensive",
  researchDomains: ["market_analysis", "competitor_research", "demographic_analysis", "industry_trends"],
  synthesisModel: "gpt-4o",
  compressionModel: "gpt-4o-mini"
};

// Research State Management
export interface ResearchState {
  topic: string;
  queries: string[];
  searchResults: any[];
  synthesizedFindings: string[];
  finalReport: string;
  confidence: number;
  sources: string[];
}

// Deep Research Prompts (adapted from Python version)
const RESEARCH_SYSTEM_PROMPT = `You are an expert market research analyst with deep domain knowledge in restaurant and cafe industry analysis.

Your role is to conduct comprehensive research on the given topic, synthesizing information from multiple sources to provide actionable insights.

Key capabilities:
- Market trend analysis
- Competitive landscape assessment
- Demographic and psychographic profiling
- Location-based opportunity identification
- Risk assessment and mitigation strategies

Always provide:
1. Executive summary with key findings
2. Detailed analysis with supporting data
3. Actionable recommendations
4. Risk factors and mitigation strategies
5. Confidence levels for each finding

Current date: ${new Date().toISOString().split('T')[0]}`;

const SYNTHESIS_PROMPT = `Synthesize the following research findings into a coherent analysis:

Research Topic: {topic}

Search Results:
{search_results}

Provide a comprehensive synthesis that:
1. Identifies key patterns and trends
2. Highlights contradictions or gaps in data
3. Draws actionable insights
4. Assigns confidence levels to findings
5. Suggests areas for further research

Format your response as structured analysis with clear sections.`;

const COMPRESSION_PROMPT = `Compress the following research findings while preserving all critical insights:

Original Research:
{research_content}

Provide a compressed version that:
1. Maintains all key findings
2. Preserves actionable recommendations
3. Keeps confidence assessments
4. Reduces redundancy
5. Improves readability

Target length: 50% of original while maintaining 100% of critical information.`;

// Deep Research Tools
export const deepResearchTools = [
  tool(
    async ({ topic, depth = "comprehensive", domains = [] }) => {
      try {
        const config = { ...DEFAULT_DEEP_RESEARCH_CONFIG, searchDepth: depth };
        const researchState = await conductDeepResearch(topic, config, domains);
        
        return {
          success: true,
          topic,
          findings: researchState.synthesizedFindings,
          report: researchState.finalReport,
          confidence: researchState.confidence,
          sources: researchState.sources,
          metadata: {
            queriesExecuted: researchState.queries.length,
            searchResultsAnalyzed: researchState.searchResults.length,
            researchDepth: depth
          }
        };
      } catch (error) {
        console.error("Deep research error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          topic
        };
      }
    },
    {
      name: "conductDeepResearch",
      description: "Conduct comprehensive deep research on a market research topic",
      schema: z.object({
        topic: z.string().describe("Research topic or question"),
        depth: z.enum(["basic", "comprehensive", "expert"]).default("comprehensive").describe("Research depth level"),
        domains: z.array(z.string()).default([]).describe("Specific research domains to focus on")
      })
    }
  ),

  tool(
    async ({ findings, compressionRatio = 0.5 }) => {
      try {
        const model = new ChatOpenAI({
          modelName: DEFAULT_DEEP_RESEARCH_CONFIG.compressionModel,
          temperature: 0.1
        });

        const compressedContent = await model.invoke([
          new SystemMessage("You are an expert at compressing research content while preserving critical insights."),
          new HumanMessage(COMPRESSION_PROMPT.replace("{research_content}", findings))
        ]);

        return {
          success: true,
          originalLength: findings.length,
          compressedLength: compressedContent.content.toString().length,
          compressionRatio: compressedContent.content.toString().length / findings.length,
          compressedContent: compressedContent.content.toString()
        };
      } catch (error) {
        console.error("Research compression error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Compression failed"
        };
      }
    },
    {
      name: "compressResearchFindings",
      description: "Compress research findings while preserving critical insights",
      schema: z.object({
        findings: z.string().describe("Research findings to compress"),
        compressionRatio: z.number().min(0.1).max(0.9).default(0.5).describe("Target compression ratio")
      })
    }
  ),

  tool(
    async ({ topic, currentFindings, additionalQueries }) => {
      try {
        const expandedQueries = await generateResearchQueries(topic, currentFindings, additionalQueries);
        const newResults = [];

        for (const query of expandedQueries) {
          const searchResults = await withRetry(() => 
            searchWeb({
              query: `${query} restaurant cafe market research`,
              maxResults: 5,
              searchDepth: "advanced"
            })
          );
          newResults.push(...searchResults);
        }

        return {
          success: true,
          newQueries: expandedQueries,
          additionalResults: newResults,
          totalNewSources: newResults.length
        };
      } catch (error) {
        console.error("Research expansion error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Expansion failed"
        };
      }
    },
    {
      name: "expandResearchScope",
      description: "Expand research scope with additional targeted queries",
      schema: z.object({
        topic: z.string().describe("Original research topic"),
        currentFindings: z.string().describe("Current research findings"),
        additionalQueries: z.array(z.string()).describe("Additional research queries to explore")
      })
    }
  )
];

// Core Deep Research Functions
export async function conductDeepResearch(
  topic: string, 
  config: DeepResearchConfig = DEFAULT_DEEP_RESEARCH_CONFIG,
  focusDomains: string[] = []
): Promise<ResearchState> {
  const researchState: ResearchState = {
    topic,
    queries: [],
    searchResults: [],
    synthesizedFindings: [],
    finalReport: "",
    confidence: 0,
    sources: []
  };

  try {
    // Step 1: Generate research queries
    const queries = await generateResearchQueries(topic, "", [], config.maxSearchQueries);
    researchState.queries = queries;

    // Step 2: Execute searches
    const searchPromises = queries.map(query => 
      withRetry(() => searchWeb({
        query: `${query} restaurant cafe market research`,
        maxResults: 5,
        searchDepth: config.searchDepth === "expert" ? "advanced" : "basic"
      }))
    );

    const searchResultsArrays = await Promise.allSettled(searchPromises);
    researchState.searchResults = searchResultsArrays
      .filter(result => result.status === "fulfilled")
      .flatMap(result => (result as PromiseFulfilledResult<any[]>).value);

    // Step 3: Synthesize findings
    const synthesizedFindings = await synthesizeResearchFindings(
      topic, 
      researchState.searchResults,
      config.synthesisModel
    );
    researchState.synthesizedFindings = [synthesizedFindings];

    // Step 4: Generate final report
    const finalReport = await generateFinalReport(
      topic,
      synthesizedFindings,
      researchState.searchResults,
      config.synthesisModel
    );
    researchState.finalReport = finalReport;

    // Step 5: Calculate confidence and extract sources
    researchState.confidence = calculateResearchConfidence(researchState.searchResults);
    researchState.sources = extractUniqueSources(researchState.searchResults);

    return researchState;
  } catch (error) {
    console.error("Deep research execution error:", error);
    throw error;
  }
}

async function generateResearchQueries(
  topic: string, 
  currentFindings: string, 
  additionalQueries: string[] = [],
  maxQueries: number = 10
): Promise<string[]> {
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7
  });

  const prompt = `Generate ${maxQueries} specific, targeted research queries for the topic: "${topic}"

Current findings: ${currentFindings || "None yet"}
Additional focus areas: ${additionalQueries.join(", ") || "None"}

Generate queries that:
1. Cover different aspects of market research
2. Are specific and actionable
3. Would yield valuable insights for restaurant/cafe business decisions
4. Avoid redundancy with current findings

Return only the queries, one per line.`;

  const response = await model.invoke([
    new SystemMessage("You are an expert at generating targeted research queries for market analysis."),
    new HumanMessage(prompt)
  ]);

  return response.content.toString()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, maxQueries);
}

async function synthesizeResearchFindings(
  topic: string,
  searchResults: any[],
  modelName: string = "gpt-4o"
): Promise<string> {
  const model = new ChatOpenAI({
    modelName,
    temperature: 0.3
  });

  const searchResultsText = searchResults
    .map(result => `Source: ${result.url}\nTitle: ${result.title}\nContent: ${result.content}`)
    .join('\n\n---\n\n');

  const prompt = SYNTHESIS_PROMPT
    .replace("{topic}", topic)
    .replace("{search_results}", searchResultsText);

  const response = await model.invoke([
    new SystemMessage(RESEARCH_SYSTEM_PROMPT),
    new HumanMessage(prompt)
  ]);

  return response.content.toString();
}

async function generateFinalReport(
  topic: string,
  synthesizedFindings: string,
  searchResults: any[],
  modelName: string = "gpt-4o"
): Promise<string> {
  const model = new ChatOpenAI({
    modelName,
    temperature: 0.2
  });

  const prompt = `Generate a comprehensive market research report for: "${topic}"

Synthesized Findings:
${synthesizedFindings}

Number of sources analyzed: ${searchResults.length}

Create a professional report with:
1. Executive Summary
2. Key Findings
3. Market Opportunities
4. Risk Assessment
5. Actionable Recommendations
6. Confidence Levels
7. Data Sources

Format as a structured business report suitable for decision-making.`;

  const response = await model.invoke([
    new SystemMessage(RESEARCH_SYSTEM_PROMPT),
    new HumanMessage(prompt)
  ]);

  return response.content.toString();
}

function calculateResearchConfidence(searchResults: any[]): number {
  if (searchResults.length === 0) return 0;
  
  // Calculate confidence based on:
  // - Number of sources
  // - Source diversity
  // - Content quality indicators
  
  const sourceCount = searchResults.length;
  const uniqueDomains = new Set(searchResults.map(result => {
    try {
      return new URL(result.url).hostname;
    } catch {
      return result.url;
    }
  })).size;
  
  const sourceScore = Math.min(sourceCount / 10, 1); // Max score at 10+ sources
  const diversityScore = Math.min(uniqueDomains / 5, 1); // Max score at 5+ unique domains
  
  return Math.round((sourceScore * 0.6 + diversityScore * 0.4) * 100) / 100;
}

function extractUniqueSources(searchResults: any[]): string[] {
  const sources = new Set<string>();
  
  searchResults.forEach(result => {
    if (result.url) {
      sources.add(result.url);
    }
  });
  
  return Array.from(sources);
}

// Export default deep research agent for use in multi-agent orchestrator
