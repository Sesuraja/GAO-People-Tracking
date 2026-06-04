export const DEFAULT_HOST = 'https://www.i360services.com/peopletrackinguhf';

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

  async getHistoryTotalCount(): Promise<number> {
    const response = await fetch(`${this.host}/api/GetHistoryTotalCount`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.text();
    return parseInt(data, 10) || 0;
  }

  async getHistoryRecords(skip: number, take: number): Promise<HistoryRecord[]> {
    const response = await fetch(`${this.host}/api/GetHistoryRecords/${skip}/${take}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data: HistoryRecord[] = await response.json();
    return data || [];
  }

  async getTagsInRealtime(): Promise<RealtimeTag[]> {
    const response = await fetch(`${this.host}/api/GetTagsInRealtime`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data: RealtimeTag[] = await response.json();
    return data || [];
  }
}

export const gaoApi = new GaoApi();
