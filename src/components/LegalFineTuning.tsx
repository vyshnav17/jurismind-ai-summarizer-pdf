import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Database, 
  Upload, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Scale,
  TrendingUp,
  Clock
} from 'lucide-react';

interface LegalDataset {
  id: string;
  name: string;
  description: string;
  language: string;
  documentType: string;
  size: number;
  status: 'available' | 'processing' | 'ready' | 'error';
  lastUpdated: string;
}

interface FineTuningJob {
  id: string;
  modelName: string;
  dataset: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  metrics?: {
    accuracy: number;
    loss: number;
    bleu: number;
  };
}

const INDIAN_LEGAL_DATASETS: LegalDataset[] = [
  {
    id: 'supreme_court_judgments',
    name: 'Supreme Court Judgments',
    description: 'Landmark judgments from the Supreme Court of India in multiple languages',
    language: 'Multi-language',
    documentType: 'Judgment',
    size: 125000,
    status: 'ready',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'high_court_orders',
    name: 'High Court Orders',
    description: 'Orders and judgments from various High Courts across India',
    language: 'Multi-language',
    documentType: 'Order/Judgment',
    size: 85000,
    status: 'ready',
    lastUpdated: '2024-01-10'
  },
  {
    id: 'district_court_decisions',
    name: 'District Court Decisions',
    description: 'Decisions from district courts in regional languages',
    language: 'Regional',
    documentType: 'Decision',
    size: 45000,
    status: 'processing',
    lastUpdated: '2024-01-12'
  },
  {
    id: 'legal_petitions',
    name: 'Legal Petitions',
    description: 'Writ petitions, PILs, and other legal petitions',
    language: 'Multi-language',
    documentType: 'Petition',
    size: 32000,
    status: 'ready',
    lastUpdated: '2024-01-08'
  },
  {
    id: 'affidavits',
    name: 'Affidavits',
    description: 'Legal affidavits and sworn statements',
    language: 'Multi-language',
    documentType: 'Affidavit',
    size: 18000,
    status: 'ready',
    lastUpdated: '2024-01-05'
  },
  {
    id: 'contracts',
    name: 'Legal Contracts',
    description: 'Commercial and legal contracts in various languages',
    language: 'Multi-language',
    documentType: 'Contract',
    size: 25000,
    status: 'available',
    lastUpdated: '2024-01-03'
  },
  {
    id: 'statutes',
    name: 'Statutes & Regulations',
    description: 'Indian statutes, acts, and regulations',
    language: 'English/Hindi',
    documentType: 'Statute',
    size: 15000,
    status: 'ready',
    lastUpdated: '2024-01-01'
  }
];

export function LegalFineTuning() {
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [fineTuningJobs, setFineTuningJobs] = useState<FineTuningJob[]>([
    {
      id: 'job-1',
      modelName: 'IndicTrans2-Legal',
      dataset: 'Supreme Court Judgments + High Court Orders',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-10T10:00:00Z',
      endTime: '2024-01-12T15:30:00Z',
      metrics: {
        accuracy: 94.2,
        loss: 0.12,
        bleu: 87.5
      }
    },
    {
      id: 'job-2',
      modelName: 'mBART-Legal-International',
      dataset: 'Legal Contracts + Statutes',
      status: 'running',
      progress: 65,
      startTime: '2024-01-14T09:00:00Z'
    }
  ]);

  const handleDatasetToggle = (datasetId: string) => {
    setSelectedDatasets(prev => 
      prev.includes(datasetId) 
        ? prev.filter(id => id !== datasetId)
        : [...prev, datasetId]
    );
  };

  const startFineTuning = () => {
    const newJob: FineTuningJob = {
      id: `job-${Date.now()}`,
      modelName: 'Custom Legal Model',
      dataset: selectedDatasets.map(id => 
        INDIAN_LEGAL_DATASETS.find(d => d.id === id)?.name
      ).join(' + '),
      status: 'pending',
      progress: 0,
      startTime: new Date().toISOString()
    };
    
    setFineTuningJobs(prev => [newJob, ...prev]);
    
    // Simulate job progression
    setTimeout(() => {
      setFineTuningJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, status: 'running' as const, progress: 10 }
          : job
      ));
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'available':
        return <Database className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Legal Domain Fine-tuning
        </CardTitle>
        <CardDescription>
          Fine-tune models on Indian judiciary datasets for enhanced legal document processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="datasets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="datasets">Available Datasets</TabsTrigger>
            <TabsTrigger value="jobs">Fine-tuning Jobs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="datasets" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Indian Legal Datasets</h3>
                <Button 
                  onClick={startFineTuning}
                  disabled={selectedDatasets.length === 0}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Fine-tuning
                </Button>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Select datasets to create a custom fine-tuned model. Larger datasets provide better accuracy but require more processing time.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {INDIAN_LEGAL_DATASETS.map((dataset) => (
                  <Card 
                    key={dataset.id} 
                    className={`cursor-pointer transition-all ${
                      selectedDatasets.includes(dataset.id) 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleDatasetToggle(dataset.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <h4 className="font-semibold">{dataset.name}</h4>
                            {getStatusIcon(dataset.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {dataset.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Scale className="h-3 w-3" />
                              {dataset.documentType}
                            </span>
                            <span>{dataset.language}</span>
                            <span>{dataset.size.toLocaleString()} documents</span>
                            <span>Updated: {dataset.lastUpdated}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={dataset.status === 'ready' ? 'default' : 'secondary'}>
                            {dataset.status}
                          </Badge>
                          {selectedDatasets.includes(dataset.id) && (
                            <Badge variant="outline" className="text-primary">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="jobs" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Fine-tuning Jobs</h3>
              
              {fineTuningJobs.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No fine-tuning jobs found. Start by selecting datasets and creating a new job.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {fineTuningJobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getJobStatusIcon(job.status)}
                              <h4 className="font-semibold">{job.modelName}</h4>
                            </div>
                            <Badge variant={
                              job.status === 'completed' ? 'default' :
                              job.status === 'running' ? 'secondary' :
                              job.status === 'failed' ? 'destructive' : 'outline'
                            }>
                              {job.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            Dataset: {job.dataset}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span>{job.progress}%</span>
                            </div>
                            <Progress value={job.progress} className="h-2" />
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Started: {new Date(job.startTime).toLocaleDateString()}</span>
                            {job.endTime && (
                              <span>Completed: {new Date(job.endTime).toLocaleDateString()}</span>
                            )}
                          </div>
                          
                          {job.metrics && (
                            <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                              <div className="text-center">
                                <div className="text-lg font-semibold text-green-600">
                                  {job.metrics.accuracy}%
                                </div>
                                <div className="text-xs text-muted-foreground">Accuracy</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-blue-600">
                                  {job.metrics.loss}
                                </div>
                                <div className="text-xs text-muted-foreground">Loss</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-purple-600">
                                  {job.metrics.bleu}
                                </div>
                                <div className="text-xs text-muted-foreground">BLEU Score</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
