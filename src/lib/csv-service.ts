import Papa from 'papaparse';

export interface CSVInfluencerRow {
  name?: string;
  url: string;
  platform?: string;
  category?: string;
  tags?: string;
  notes?: string;
}

export interface BatchUploadResult {
  success: number;
  failed: number;
  total: number;
  errors: Array<{
    row: number;
    url: string;
    error: string;
  }>;
}

export class CSVService {
  static parseCSV(file: File): Promise<CSVInfluencerRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Normalize header names to match our interface
          const normalized = header.toLowerCase().trim();
          switch (normalized) {
            case 'name':
            case '姓名':
            case '網紅名稱':
              return 'name';
            case 'url':
            case 'link':
            case '連結':
            case '網址':
              return 'url';
            case 'platform':
            case '平台':
              return 'platform';
            case 'category':
            case '分類':
            case '類別':
              return 'category';
            case 'tags':
            case '標籤':
            case '標簽':
              return 'tags';
            case 'notes':
            case '備註':
            case '說明':
              return 'notes';
            default:
              return normalized;
          }
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV 解析錯誤: ${results.errors[0].message}`));
            return;
          }

          const validRows = results.data.filter((row: unknown) => {
            return (row as CSVInfluencerRow).url && (row as CSVInfluencerRow).url.trim() !== '';
          }) as CSVInfluencerRow[];

          if (validRows.length === 0) {
            reject(new Error('CSV 檔案中沒有找到有效的 URL 欄位'));
            return;
          }

          resolve(validRows);
        },
        error: (error) => {
          reject(new Error(`CSV 讀取失敗: ${error.message}`));
        }
      });
    });
  }

  static validateCSVRow(row: CSVInfluencerRow, index: number): string | null {
    if (!row.url) {
      return `第 ${index + 1} 列：缺少 URL`;
    }

    try {
      new URL(row.url);
    } catch {
      return `第 ${index + 1} 列：無效的 URL 格式`;
    }

    // Check if URL is from supported platforms
    const supportedDomains = [
      'instagram.com',
      'youtube.com',
      'tiktok.com',
      'facebook.com',
      'twitter.com',
      'x.com'
    ];

    const url = new URL(row.url);
    const isSupported = supportedDomains.some(domain =>
      url.hostname.includes(domain)
    );

    if (!isSupported) {
      return `第 ${index + 1} 列：不支援的平台 (${url.hostname})`;
    }

    return null;
  }

  static generateSampleCSV(): string {
    const sampleData = [
      {
        name: '美妝達人小雅',
        url: 'https://www.instagram.com/beauty_guru_tw',
        platform: 'Instagram',
        category: '美妝',
        tags: '美妝,護膚,彩妝',
        notes: '主要分享美妝教學和產品評測'
      },
      {
        name: '旅遊部落客阿明',
        url: 'https://www.youtube.com/c/travel_blogger_ming',
        platform: 'YouTube',
        category: '旅遊',
        tags: '旅遊,景點,美食',
        notes: '專業旅遊頻道，粉絲互動率高'
      },
      {
        name: '健身教練小華',
        url: 'https://www.tiktok.com/@fitness_coach_hua',
        platform: 'TikTok',
        category: '健身',
        tags: '健身,運動,減肥',
        notes: '健身動作教學，年輕族群關注度高'
      }
    ];

    return Papa.unparse(sampleData, {
      header: true
    });
  }

  static downloadSampleCSV(): void {
    const csvContent = this.generateSampleCSV();
    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'kol_sample_網紅批次上傳範本.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
