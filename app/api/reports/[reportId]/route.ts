import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/server-utils/storage';
import { authenticateRequest } from '@/server-utils/nextAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportId } = params;
    const report = await storage.getReport(reportId);
    
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check if user owns this report
    if (report.userId !== user.claims.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Ensure all data is JSON serializable
    const serializedReport = {
      id: report.id,
      sessionId: report.sessionId,
      userId: report.userId,
      title: report.title,
      content: report.content,
      summary: report.summary,
      metadata: report.metadata,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };

    return NextResponse.json(serializedReport);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
