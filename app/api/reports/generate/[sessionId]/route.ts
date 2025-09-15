import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/server-utils/storage';
import { authenticateRequest } from '@/server-utils/nextAuth';
import { generateReport } from '@/server-utils/reportGenerator';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;
    
    // Verify session exists and user owns it
    const session = await storage.getChatSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.userId !== user.claims.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get messages for the session
    const messages = await storage.getChatMessages(sessionId);
    
    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages found in session' },
        { status: 400 }
      );
    }

    // Generate the report
    const report = await generateReport(sessionId, 'comprehensive');

    // Store the report
    const savedReport = await storage.createReport({
      sessionId,
      userId: user.claims.sub,
      title: `Market Research Report - ${session.title}`,
      content: JSON.stringify(report.sections), // Store sections as content
      summary: report.executiveSummary.keyFindings.join('\n'), // Join key findings as summary
      recommendations: JSON.stringify(report.executiveSummary.recommendations),
      insights: JSON.stringify(report.insights),
      marketScore: report.executiveSummary.overallScore,
      metadata: JSON.stringify({
        reportType: report.reportType,
        generatedAt: report.generatedAt,
        subtitle: report.subtitle
      })
    });

    // Ensure all data is JSON serializable
    const serializedReport = {
      id: savedReport.id,
      sessionId: savedReport.sessionId,
      userId: savedReport.userId,
      title: savedReport.title,
      content: savedReport.content,
      summary: savedReport.summary,
      metadata: savedReport.metadata,
      createdAt: savedReport.createdAt,
      updatedAt: savedReport.updatedAt,
    };

    return NextResponse.json(serializedReport);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
