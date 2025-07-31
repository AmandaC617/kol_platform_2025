"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ExportService } from "@/lib/export-service";
import {
  Influencer,
  Evaluation,
  Project,
  EnhancedInfluencerProfile,
  DemoInfluencer
} from "@/types";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Image,
  Loader2
} from "lucide-react";

interface ExportButtonProps {
  type: 'single' | 'comparison' | 'project';
  data: {
    project: Project;
    influencer?: Influencer | DemoInfluencer;
    influencers?: (Influencer | DemoInfluencer)[];
    evaluations?: Evaluation[];
    evaluationsMap?: { [influencerId: string]: Evaluation[] };
    enhancedProfile?: EnhancedInfluencerProfile;
    enhancedProfilesMap?: { [influencerId: string]: EnhancedInfluencerProfile };
  };
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const ExportButton = ({
  type,
  data,
  variant = 'outline',
  size = 'sm',
  className = ''
}: ExportButtonProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (exportType: string) => {
    setLoading(exportType);

    try {
      switch (exportType) {
        case 'pdf-single':
          if (data.influencer && data.evaluations) {
            await ExportService.exportInfluencerPDF({
              project: data.project,
              influencer: data.influencer,
              evaluations: data.evaluations,
              enhancedProfile: data.enhancedProfile
            });
          }
          break;

        case 'excel-single':
          if (data.influencer && data.evaluations) {
            await ExportService.exportEvaluationsExcel({
              project: data.project,
              influencer: data.influencer,
              evaluations: data.evaluations,
              enhancedProfile: data.enhancedProfile
            });
          }
          break;

        case 'excel-comparison':
          if (data.influencers && data.evaluationsMap) {
            await ExportService.exportComparisonExcel({
              project: data.project,
              influencers: data.influencers,
              evaluationsMap: data.evaluationsMap,
              enhancedProfilesMap: data.enhancedProfilesMap
            });
          }
          break;

        case 'pdf-project':
          if (data.influencers && data.evaluationsMap) {
            await ExportService.exportProjectSummaryPDF(
              data.project,
              data.influencers,
              data.evaluationsMap
            );
          }
          break;

        case 'chart-pdf':
          // 這個功能需要傳入特定的圖表元素ID
          const chartElement = document.querySelector('[data-chart="comparison"]') as HTMLElement;
          if (chartElement) {
            await ExportService.exportElementToPDF(
              chartElement.id || 'chart-container',
              `${data.project.name}_圖表`
            );
          }
          break;

        default:
          throw new Error('不支援的導出類型');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`導出失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setLoading(null);
    }
  };

  const renderSingleExportOptions = () => (
    <>
      <DropdownMenuItem
        onClick={() => handleExport('pdf-single')}
        disabled={loading !== null}
        className="flex items-center space-x-2"
      >
        {loading === 'pdf-single' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span>PDF 完整報告</span>
        <Badge variant="secondary" className="ml-auto text-xs">推薦</Badge>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => handleExport('excel-single')}
        disabled={loading !== null}
        className="flex items-center space-x-2"
      >
        {loading === 'excel-single' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        <span>Excel 數據表格</span>
      </DropdownMenuItem>
    </>
  );

  const renderComparisonExportOptions = () => (
    <>
      <DropdownMenuItem
        onClick={() => handleExport('excel-comparison')}
        disabled={loading !== null}
        className="flex items-center space-x-2"
      >
        {loading === 'excel-comparison' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        <span>Excel 比較報告</span>
        <Badge variant="secondary" className="ml-auto text-xs">推薦</Badge>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => handleExport('chart-pdf')}
        disabled={loading !== null}
        className="flex items-center space-x-2"
      >
        {loading === 'chart-pdf' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Image className="w-4 h-4" />
        )}
        <span>PDF 圖表截圖</span>
      </DropdownMenuItem>
    </>
  );

  const renderProjectExportOptions = () => (
    <>
      <DropdownMenuItem
        onClick={() => handleExport('pdf-project')}
        disabled={loading !== null}
        className="flex items-center space-x-2"
      >
        {loading === 'pdf-project' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span>PDF 專案總結</span>
        <Badge variant="secondary" className="ml-auto text-xs">推薦</Badge>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => handleExport('excel-comparison')}
        disabled={loading !== null}
        className="flex items-center space-x-2"
      >
        {loading === 'excel-comparison' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        <span>Excel 完整數據</span>
      </DropdownMenuItem>
    </>
  );

  const getButtonText = () => {
    switch (type) {
      case 'single': return '導出報告';
      case 'comparison': return '導出比較';
      case 'project': return '導出專案';
      default: return '導出';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`flex items-center space-x-2 ${className}`}
          disabled={loading !== null}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{getButtonText()}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-semibold">選擇導出格式</p>
          <p className="text-xs text-gray-500">
            {type === 'single' && '單個網紅的詳細分析報告'}
            {type === 'comparison' && '多個網紅的對比分析'}
            {type === 'project' && '整個專案的總結報告'}
          </p>
        </div>

        <DropdownMenuSeparator />

        {type === 'single' && renderSingleExportOptions()}
        {type === 'comparison' && renderComparisonExportOptions()}
        {type === 'project' && renderProjectExportOptions()}

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <p className="text-xs text-gray-500">
            💡 PDF 適合列印和分享，Excel 適合進一步分析
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
