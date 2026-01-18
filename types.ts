
export interface VideoGenerationResult {
  uri: string;
  id: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  prompt: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  PREPARING = 'PREPARING',
  GENERATING = 'GENERATING',
  POLLING = 'POLLING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
