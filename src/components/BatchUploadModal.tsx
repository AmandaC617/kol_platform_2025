"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CSVService, CSVInfluencerRow, BatchUploadResult } from "@/lib/csv-service";
import { GeminiService } from "@/lib/gemini-service";
import { FirebaseService } from "@/lib/firebase-service";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, CheckCircle, XCircle, FileSpreadsheet } from "lucide-react";

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onUploadComplete: () => void;
}

export const BatchUploadModal = ({
  isOpen,
  onClose,
  projectId,
  onUploadComplete
}: BatchUploadModalProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState('');
  const [uploadResult, setUploadResult] = useState<BatchUploadResult | null>(null);
  const [csvData, setCsvData] = useState<CSVInfluencerRow[]>([]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('請選擇 CSV 檔案');
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);

    try {
      const data = await CSVService.parseCSV(file);
      setCsvData(data);
    } catch (error) {
      alert(error instanceof Error ? error.message : '檔案解析失敗');
      setSelectedFile(null);
    }
  };

  const handleDownloadSample = () => {
    CSVService.downloadSampleCSV();
  };

  const validateData = (): string[] => {
    const errors: string[] = [];
    csvData.forEach((row, index) => {
      const error = CSVService.validateCSVRow(row, index);
      if (error) {
        errors.push(error);
      }
    });
    return errors;
  };

  const handleBatchUpload = async () => {
    if (!user || !selectedFile || csvData.length === 0) return;

    const validationErrors = validateData();
    if (validationErrors.length > 0) {
      alert(`資料驗證失敗：\n${validationErrors.slice(0, 5).join('\n')}${validationErrors.length > 5 ? '\n...' : ''}`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    const result: BatchUploadResult = {
      success: 0,
      failed: 0,
      total: csvData.length,
      errors: []
    };

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const progress = ((i + 1) / csvData.length) * 100;
      setUploadProgress(progress);
      setCurrentProcessing(`正在處理: ${row.name || row.url}`);

      try {
        // Analyze influencer data using AI
        const profile = await GeminiService.analyzeInfluencer(row.url);

        // Override with CSV data if provided
        if (row.name) profile.name = row.name;
        if (row.platform) profile.platform = row.platform;
        if (row.notes) profile.bio = row.notes;

        // Save to database
        // 保存網紅資料到資料庫
        
        await FirebaseService.createInfluencer(user.uid, projectId, {
          url: row.url,
          platform: profile.platform,
          profile,
          createdBy: user.uid,
          tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
          notes: row.notes || ""
        });
        
        // 資料保存成功

        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          url: row.url,
          error: error instanceof Error ? error.message : '未知錯誤'
        });
      }

      // Add small delay to avoid overwhelming APIs
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setUploadResult(result);
    setIsUploading(false);
    setCurrentProcessing('');

    if (result.success > 0) {
      onUploadComplete();
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setCsvData([]);
    setUploadResult(null);
    setUploadProgress(0);
    setCurrentProcessing('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      resetModal();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5" />
            <span>批次上傳網紅</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">使用說明</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 支援 CSV 格式檔案</li>
              <li>• 必填欄位：URL (網紅社群媒體連結)</li>
              <li>• 選填欄位：姓名、平台、分類、備註</li>
              <li>• 支援平台：Instagram, YouTube, TikTok, Facebook, Twitter</li>
            </ul>
          </div>

          {/* Download Sample */}
          <div className="flex justify-between items-center">
            <Label>範本下載</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSample}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>下載 CSV 範本</span>
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">選擇 CSV 檔案</Label>
            <Input
              id="csv-file"
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>

          {/* File Info */}
          {selectedFile && csvData.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                已選擇檔案：{selectedFile.name} ({csvData.length} 筆網紅資料)
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>上傳進度</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-600">{currentProcessing}</p>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className="space-y-3">
              <Alert className={uploadResult.failed === 0 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div>上傳完成！</div>
                    <div className="text-sm">
                      成功：{uploadResult.success} 筆 |
                      失敗：{uploadResult.failed} 筆 |
                      總計：{uploadResult.total} 筆
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {uploadResult.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto">
                  <h5 className="font-semibold text-red-600 mb-2">錯誤清單：</h5>
                  {uploadResult.errors.slice(0, 10).map((error, index) => (
                    <div key={index} className="text-sm text-red-600 mb-1">
                      第 {error.row} 列 ({error.url}): {error.error}
                    </div>
                  ))}
                  {uploadResult.errors.length > 10 && (
                    <div className="text-sm text-gray-500">
                      還有 {uploadResult.errors.length - 10} 個錯誤...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              {uploadResult ? '關閉' : '取消'}
            </Button>
            {selectedFile && csvData.length > 0 && !uploadResult && (
              <Button
                onClick={handleBatchUpload}
                disabled={isUploading}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>開始批次上傳 ({csvData.length} 筆)</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
