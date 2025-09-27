import type { 
  BrochureConfig, 
  BrochureData, 
  BrochureComponents,
  GenerateBrochureRequest,
  CombinedBrochureRequest,
  ImageGenerationRequest,
  ImageGenerationResponse
} from '@/types/api';

const API_BASE = 'http://localhost:8000';

class ApiService {
  // Configuration endpoints
  async getConfigurations(): Promise<BrochureConfig[]> {
    const response = await fetch(`${API_BASE}/configurations`);
    if (!response.ok) throw new Error('Failed to fetch configurations');
    return response.json();
  }

  async getConfiguration(configId: string): Promise<BrochureConfig> {
    const response = await fetch(`${API_BASE}/configurations/${configId}`);
    if (!response.ok) throw new Error('Failed to fetch configuration');
    return response.json();
  }

  async createConfiguration(config: Omit<BrochureConfig, 'id' | 'created_at'>): Promise<BrochureConfig> {
    const response = await fetch(`${API_BASE}/configurations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Failed to create configuration');
    return response.json();
  }

  async updateConfiguration(config: BrochureConfig): Promise<BrochureConfig> {
    const response = await fetch(`${API_BASE}/configurations/${config.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Failed to update configuration');
    return response.json();
  }

  // Data endpoints
  async getAllData(): Promise<{ data: BrochureData[] }> {
    const response = await fetch(`${API_BASE}/data`);
    if (!response.ok) throw new Error('Failed to fetch data');
    return response.json();
  }

  async getDataColumns(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/data/columns`);
    if (!response.ok) throw new Error('Failed to fetch columns');
    return response.json();
  }

  async getDataSample(limit = 10): Promise<BrochureData[]> {
    const response = await fetch(`${API_BASE}/data/sample?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch sample data');
    return response.json();
  }

  // Component endpoints
  async extractComponents(configId: string, data: BrochureData): Promise<BrochureComponents> {
    const response = await fetch(`${API_BASE}/configurations/${configId}/components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to extract components');
    return response.json();
  }

  async extractComponentsBatch(configId: string, data: BrochureData[]): Promise<any> {
    const response = await fetch(`${API_BASE}/configurations/${configId}/componentsbatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to extract components batch');
    return response.json();
  }

  async getComponentsBySku(configId: string, sku: string): Promise<BrochureComponents> {
    const response = await fetch(`${API_BASE}/configurations/${configId}/components/${sku}`);
    if (!response.ok) throw new Error('Failed to fetch components by SKU');
    return response.json();
  }

  // Generation endpoints
  async generateBrochure(request: GenerateBrochureRequest): Promise<any> {
    const response = await fetch(`${API_BASE}/configurations/${request.config_id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to generate brochure');
    return response.json();
  }

  async generateCombinedBrochure(request: CombinedBrochureRequest): Promise<any> {
    const response = await fetch(`${API_BASE}/configurations/${request.config_id}/generate-combined`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to generate combined brochure');
    return response.json();
  }

  // Download endpoint
  async downloadFile(filename: string): Promise<Blob> {
    const response = await fetch(`${API_BASE}/download/${filename}`);
    if (!response.ok) throw new Error('Failed to download file');
    return response.blob();
  }

  // Image Generation Agent endpoint (placeholder - you'll implement this)
  async generateImageWithAgent(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    // This endpoint doesn't exist yet - you'll need to create it
    const response = await fetch(`${API_BASE}/generate-image-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to generate image with agent');
    return response.json();
  }
}

export const apiService = new ApiService();