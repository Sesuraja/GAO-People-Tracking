export const DEFAULT_HOST = '';

export interface HistoryRecord {
  TagID: string;
  FirstName: string;
  LastName: string;
  LocationName: string;
  EnterTime?: string;
  EnterTimeStr?: string;
  LeaveTime?: string;
  LeaveTimeStr?: string;
  Duration: number;
}

export interface RealtimeTag {
  TagID: string;
  Timestamp: string;
  Location: string;
}

class GaoApi {
  private host: string;

  constructor(host: string = DEFAULT_HOST) {
    this.host = host;
  }

  setHost(host: string) {
    this.host = host.replace(/\/$/, ''); // Remove trailing slash
  }

  getHost() {
    return this.host;
  }

  getProxyHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    const targetHost = localStorage.getItem('gao_api_url') || '';
    if (targetHost) {
      headers['x-gao-target-host'] = targetHost;
    }

    const authType = localStorage.getItem('gao_auth_type') || 'none';
    headers['x-gao-auth-type'] = authType;

    if (authType === 'api_key') {
      const apiKey = localStorage.getItem('gao_api_key') || '';
      const apiKeyHeader = localStorage.getItem('gao_api_key_header') || 'X-API-Key';
      headers['x-gao-api-key'] = apiKey;
      headers['x-gao-api-key-header'] = apiKeyHeader;
    } else if (authType === 'bearer') {
      const token = localStorage.getItem('gao_bearer_token') || '';
      headers['x-gao-bearer-token'] = token;
    } else if (authType === 'basic') {
      const username = localStorage.getItem('gao_username') || '';
      const password = localStorage.getItem('gao_password') || '';
      headers['x-gao-username'] = username;
      headers['x-gao-password'] = password;
    } else if (authType === 'oauth') {
      const clientId = localStorage.getItem('gao_oauth_client_id') || '';
      const clientSecret = localStorage.getItem('gao_oauth_client_secret') || '';
      const tokenUrl = localStorage.getItem('gao_oauth_token_url') || '';
      headers['x-gao-oauth-client-id'] = clientId;
      headers['x-gao-oauth-client-secret'] = clientSecret;
      headers['x-gao-oauth-token-url'] = tokenUrl;
    }

    return headers;
  }

  async getHistoryTotalCount(customHeaders?: Record<string, string>): Promise<number> {
    const headers = customHeaders || this.getProxyHeaders();
    const response = await fetch(`${this.host}/api/GetHistoryTotalCount`, {
      headers
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.text();
    return parseInt(data, 10) || 0;
  }

  async getHistoryRecords(skip: number, take: number, customHeaders?: Record<string, string>): Promise<HistoryRecord[]> {
    const headers = customHeaders || this.getProxyHeaders();
    const response = await fetch(`${this.host}/api/GetHistoryRecords/${skip}/${take}`, {
      headers
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async getTagsInRealtime(customHeaders?: Record<string, string>): Promise<RealtimeTag[]> {
    const headers = customHeaders || this.getProxyHeaders();
    const response = await fetch(`${this.host}/api/GetTagsInRealtime`, {
      headers
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }
}

export const gaoApi = new GaoApi();
