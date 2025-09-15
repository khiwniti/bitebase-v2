/**
 * Multi-Agent Orchestrator for Restaurant Market Research
 * Coordinates specialized agents and manages collaborative analysis
 */

import { RunnableConfig } from "@langchain/core/runnables";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage, SystemMessage, HumanMessage } from "@langchain/core/messages";
import { MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { convertActionsToDynamicStructuredTools } from "@copilotkit/sdk-js/langgraph";
import { MarketResearchStateAnnotation, marketResearchTools } from "./marketResearchAgents";
import type { MarketResearchState } from "./marketResearchAgents";

// Agent Personas and System Prompts
const AGENT_PERSONAS = {
  coordinator: `You are the Market Research Coordinator, an expert in restaurant industry analysis. You orchestrate a team of specialized agents to provide comprehensive market research for restaurant and cafe ventures.

Your role is to:
1. Understand user requirements and break down complex research requests
2. Coordinate with specialized agents (Demographics, Competitors, Traffic, Sites, Zoning)
3. Synthesize findings from all agents into actionable insights
4. Provide strategic recommendations based on comprehensive analysis
5. Maintain context and ensure all aspects of market research are covered

You work with these specialized agents:
- Demographics Agent: Analyzes target market and population data
- Competitor Agent: Researches competitive landscape and positioning
- Traffic Agent: Studies foot traffic patterns and visitor behavior  
- Sites Agent: Recommends optimal locations based on all factors
- Zoning Agent: Ensures regulatory compliance and permit requirements

Always maintain a professional, data-driven approach while being conversational and helpful.`,

  demographics: `You are the Demographics Analysis Agent, specializing in population and market analysis for restaurant ventures.

Your expertise includes:
- Population demographics and psychographics
- Income levels and spending patterns
- Age distribution and lifestyle preferences
- Market potential assessment
- Target customer profiling
- Dining behavior analysis

You provide detailed demographic insights that help determine if a location has the right customer base for a specific restaurant concept.`,

  competitors: `You are the Competitor Research Agent, expert in competitive landscape analysis for the restaurant industry.

Your expertise includes:
- Identifying direct and indirect competitors
- Analyzing competitor strengths and weaknesses
- Market positioning and differentiation opportunities
- Pricing strategy analysis
- Service gap identification
- Competitive advantage recommendations

You help businesses understand their competitive environment and find opportunities to differentiate.`,

  traffic: `You are the Foot Traffic Analysis Agent, specializing in location-based visitor pattern analysis.

Your expertise includes:
- Daily and hourly traffic patterns
- Visitor demographics and behavior
- Seasonal trends and variations
- Peak hour identification
- Customer journey mapping
- Location accessibility analysis

You provide insights on when and how many potential customers visit a location.`,

  sites: `You are the Site Recommendation Agent, expert in location selection for restaurant ventures.

Your expertise includes:
- Site scoring and ranking methodologies
- ROI projections and financial analysis
- Location accessibility and visibility
- Space requirements and layout optimization
- Lease negotiation considerations
- Risk assessment for different locations

You synthesize all research to recommend the best possible locations.`,

  zoning: `You are the Zoning Compliance Agent, specializing in regulatory requirements for restaurant operations.

Your expertise includes:
- Zoning laws and commercial use permissions
- Permit and license requirements
- Health department regulations
- Fire safety and building codes
- Timeline and cost estimation for approvals
- Risk assessment for compliance issues

You ensure all regulatory requirements are understood and achievable.`
};

// Main orchestrator node
async function coordinatorNode(state: MarketResearchState, config: RunnableConfig) {
  const model = new ChatOpenAI({ temperature: 0.3, model: "gpt-4o" });
  
  const modelWithTools = model.bindTools([
    ...convertActionsToDynamicStructuredTools(state.tools || []),
    ...marketResearchTools,
  ]);

  const systemMessage = new SystemMessage({
    content: AGENT_PERSONAS.coordinator
  });

  // Determine which agents should be activated based on the conversation
  const lastMessage = state.messages[state.messages.length - 1];
  const messageContent = lastMessage?.content?.toString().toLowerCase() || '';
  
  // Analyze what type of research is needed
  let analysisNeeded = [];
  if (messageContent.includes('demographic') || messageContent.includes('population') || messageContent.includes('market')) {
    analysisNeeded.push('demographics');
  }
  if (messageContent.includes('competitor') || messageContent.includes('competition') || messageContent.includes('rival')) {
    analysisNeeded.push('competitors');
  }
  if (messageContent.includes('traffic') || messageContent.includes('foot') || messageContent.includes('visitor')) {
    analysisNeeded.push('traffic');
  }
  if (messageContent.includes('location') || messageContent.includes('site') || messageContent.includes('address')) {
    analysisNeeded.push('sites');
  }
  if (messageContent.includes('permit') || messageContent.includes('zoning') || messageContent.includes('license')) {
    analysisNeeded.push('zoning');
  }

  // If it's a general query, activate all agents for comprehensive analysis
  if (analysisNeeded.length === 0 && (
    messageContent.includes('restaurant') || 
    messageContent.includes('cafe') || 
    messageContent.includes('open') ||
    messageContent.includes('start')
  )) {
    analysisNeeded = ['demographics', 'competitors', 'traffic', 'sites', 'zoning'];
  }

  const response = await modelWithTools.invoke([
    systemMessage,
    ...state.messages,
    new HumanMessage({
      content: `Current analysis phase: ${state.agentCollaboration.analysisPhase}
      Active agents: ${state.agentCollaboration.activeAgents.join(', ')}
      Shared findings: ${JSON.stringify(state.agentCollaboration.sharedFindings, null, 2)}
      
      Based on the user's request, coordinate the appropriate specialized agents to provide comprehensive market research.
      Agents needed for this query: ${analysisNeeded.join(', ')}`
    })
  ], config);

  return {
    messages: [response],
    agentCollaboration: {
      ...state.agentCollaboration,
      activeAgents: analysisNeeded,
      analysisPhase: analysisNeeded.length > 0 ? 'analysis' : state.agentCollaboration.analysisPhase
    }
  };
}

// Specialized agent nodes
async function demographicsNode(state: MarketResearchState, config: RunnableConfig) {
  const model = new ChatOpenAI({ temperature: 0.2, model: "gpt-4o" });
  const modelWithTools = model.bindTools(marketResearchTools);

  const systemMessage = new SystemMessage({
    content: AGENT_PERSONAS.demographics
  });

  const response = await modelWithTools.invoke([
    systemMessage,
    new HumanMessage({
      content: `Analyze demographics for the location mentioned in this conversation. 
      Current context: ${JSON.stringify(state.analysisContext)}
      Location: ${state.currentLocation?.address || 'Please specify location'}`
    })
  ], config);

  return {
    messages: [response],
    agentCollaboration: {
      ...state.agentCollaboration,
      sharedFindings: {
        ...state.agentCollaboration.sharedFindings,
        demographics: "Demographics analysis completed"
      }
    }
  };
}

async function competitorsNode(state: MarketResearchState, config: RunnableConfig) {
  const model = new ChatOpenAI({ temperature: 0.2, model: "gpt-4o" });
  const modelWithTools = model.bindTools(marketResearchTools);

  const systemMessage = new SystemMessage({
    content: AGENT_PERSONAS.competitors
  });

  const response = await modelWithTools.invoke([
    systemMessage,
    new HumanMessage({
      content: `Analyze competitors for the business type and location mentioned. 
      Business type: ${state.analysisContext?.businessType || 'restaurant'}
      Location: ${state.currentLocation?.address || 'Please specify location'}`
    })
  ], config);

  return {
    messages: [response],
    agentCollaboration: {
      ...state.agentCollaboration,
      sharedFindings: {
        ...state.agentCollaboration.sharedFindings,
        competitors: "Competitor analysis completed"
      }
    }
  };
}

async function trafficNode(state: MarketResearchState, config: RunnableConfig) {
  const model = new ChatOpenAI({ temperature: 0.2, model: "gpt-4o" });
  const modelWithTools = model.bindTools(marketResearchTools);

  const systemMessage = new SystemMessage({
    content: AGENT_PERSONAS.traffic
  });

  const response = await modelWithTools.invoke([
    systemMessage,
    new HumanMessage({
      content: `Analyze foot traffic patterns for the specified location.
      Location: ${state.currentLocation?.address || 'Please specify location'}`
    })
  ], config);

  return {
    messages: [response],
    agentCollaboration: {
      ...state.agentCollaboration,
      sharedFindings: {
        ...state.agentCollaboration.sharedFindings,
        traffic: "Traffic analysis completed"
      }
    }
  };
}

async function sitesNode(state: MarketResearchState, config: RunnableConfig) {
  const model = new ChatOpenAI({ temperature: 0.2, model: "gpt-4o" });
  const modelWithTools = model.bindTools(marketResearchTools);

  const systemMessage = new SystemMessage({
    content: AGENT_PERSONAS.sites
  });

  const response = await modelWithTools.invoke([
    systemMessage,
    new HumanMessage({
      content: `Generate site recommendations based on all available analysis.
      Business type: ${state.analysisContext?.businessType || 'restaurant'}
      Location area: ${state.currentLocation?.address || 'Please specify location'}
      Budget: ${state.analysisContext?.budget || 'Not specified'}
      Shared findings: ${JSON.stringify(state.agentCollaboration.sharedFindings)}`
    })
  ], config);

  return {
    messages: [response],
    agentCollaboration: {
      ...state.agentCollaboration,
      sharedFindings: {
        ...state.agentCollaboration.sharedFindings,
        sites: "Site recommendations completed"
      }
    }
  };
}

async function zoningNode(state: MarketResearchState, config: RunnableConfig) {
  const model = new ChatOpenAI({ temperature: 0.2, model: "gpt-4o" });
  const modelWithTools = model.bindTools(marketResearchTools);

  const systemMessage = new SystemMessage({
    content: AGENT_PERSONAS.zoning
  });

  const response = await modelWithTools.invoke([
    systemMessage,
    new HumanMessage({
      content: `Check zoning compliance and permit requirements.
      Business type: ${state.analysisContext?.businessType || 'restaurant'}
      Location: ${state.currentLocation?.address || 'Please specify location'}`
    })
  ], config);

  return {
    messages: [response],
    agentCollaboration: {
      ...state.agentCollaboration,
      sharedFindings: {
        ...state.agentCollaboration.sharedFindings,
        zoning: "Zoning compliance analysis completed"
      }
    }
  };
}

// Routing logic
function shouldContinue(state: MarketResearchState) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  
  if (lastMessage.tool_calls?.length) {
    return "tool_node";
  }
  
  // Check if we need to route to specialized agents
  const activeAgents = state.agentCollaboration.activeAgents;
  const completedAnalyses = Object.keys(state.agentCollaboration.sharedFindings);
  
  for (const agent of activeAgents) {
    if (!completedAnalyses.includes(agent)) {
      return `${agent}_node`;
    }
  }
  
  return "__end__";
}

// Create the multi-agent workflow
const workflow = new StateGraph(MarketResearchStateAnnotation)
  .addNode("coordinator", coordinatorNode)
  .addNode("demographics_node", demographicsNode)
  .addNode("competitors_node", competitorsNode)
  .addNode("traffic_node", trafficNode)
  .addNode("sites_node", sitesNode)
  .addNode("zoning_node", zoningNode)
  .addNode("tool_node", new ToolNode(marketResearchTools))
  .addEdge(START, "coordinator")
  .addEdge("tool_node", "coordinator")
  .addEdge("demographics_node", "coordinator")
  .addEdge("competitors_node", "coordinator")
  .addEdge("traffic_node", "coordinator")
  .addEdge("sites_node", "coordinator")
  .addEdge("zoning_node", "coordinator")
  .addConditionalEdges("coordinator", shouldContinue);

const memory = new MemorySaver();

export const marketResearchGraph = workflow.compile({
  checkpointer: memory,
});

export type { MarketResearchState };
export { MarketResearchStateAnnotation };
