'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Download, 
  Share, 
  FileText, 
  Calendar,
  MapPin,
  TrendingUp,
  Users,
  Building,
  Target,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  sessionId: string;
  userId: string;
  title: string;
  content: string;
  summary: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export default function ReportPage({ params }: { params: { reportId: string } }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [reportContent, setReportContent] = useState<any>(null);

  // Fetch report data
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['/api/reports', params.reportId],
    enabled: !!params.reportId && isAuthenticated,
    retry: false,
  }) as { data: Report | undefined, isLoading: boolean, error: any };

  // Parse report content
  useEffect(() => {
    if (report?.content) {
      try {
        const parsed = typeof report.content === 'string' 
          ? JSON.parse(report.content) 
          : report.content;
        setReportContent(parsed);
      } catch (error) {
        console.error('Error parsing report content:', error);
        setReportContent({ sections: [] });
      }
    }
  }, [report]);

  // Handle unauthorized access
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to view this report",
        variant: "destructive",
      });
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router, toast]);

  const handleDownload = () => {
    if (!report) return;
    
    // Create a simple text version of the report
    const textContent = `
${report.title}
Generated: ${new Date(report.createdAt).toLocaleDateString()}

SUMMARY:
${report.summary}

DETAILED ANALYSIS:
${reportContent?.sections?.map((section: any) => `
${section.title}:
${section.content}
`).join('\n') || 'No detailed content available'}
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The report you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{report.title}</h1>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Generated {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Summary Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {report.summary || 'No summary available'}
            </p>
          </CardContent>
        </Card>

        {/* Report Sections */}
        {reportContent?.sections?.map((section: any, index: number) => (
          <Card key={index} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                {section.icon && <span className="mr-2">{section.icon}</span>}
                {section.title}
              </CardTitle>
              {section.subtitle && (
                <CardDescription>{section.subtitle}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {typeof section.content === 'string' ? (
                  <p className="whitespace-pre-wrap">{section.content}</p>
                ) : (
                  <div>
                    {section.content?.map((item: any, itemIndex: number) => (
                      <div key={itemIndex} className="mb-4">
                        {item.type === 'text' && <p>{item.value}</p>}
                        {item.type === 'list' && (
                          <ul className="list-disc list-inside space-y-1">
                            {item.items?.map((listItem: string, listIndex: number) => (
                              <li key={listIndex}>{listItem}</li>
                            ))}
                          </ul>
                        )}
                        {item.type === 'metric' && (
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-2xl font-bold text-primary">{item.value}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )) || (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No detailed content available</p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        {report.metadata && Object.keys(report.metadata).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(report.metadata).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-sm font-medium text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm">{String(value)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
