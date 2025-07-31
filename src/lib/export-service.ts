"use client";

import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import {
  Influencer,
  Evaluation,
  Project,
  EnhancedInfluencerProfile,
  EvaluationScores,
  DemoInfluencer
} from '@/types';

interface ExportData {
  project: Project;
  influencer: Influencer | DemoInfluencer;
  evaluations: Evaluation[];
  enhancedProfile?: EnhancedInfluencerProfile;
}

interface ComparisonExportData {
  project: Project;
  influencers: (Influencer | DemoInfluencer)[];
  evaluationsMap: { [influencerId: string]: Evaluation[] };
  enhancedProfilesMap?: { [influencerId: string]: EnhancedInfluencerProfile };
}

export class ExportService {

  /**
   * Helper function to safely access influencer properties
   */
  private static getInfluencerProperty(influencer: Influencer | DemoInfluencer, property: string): string {
    if ('name' in influencer) {
      // DemoInfluencer
      switch (property) {
        case 'name': return influencer.name;
        case 'platform': return influencer.platform;
        case 'followers': return influencer.followers;
        case 'bio': return '專業網紅';
        case 'url': return influencer.url;
        case 'latestScore': return influencer.latestScore?.toString() || 'N/A';
        default: return 'N/A';
      }
    } else {
      // Influencer
      switch (property) {
        case 'name': return influencer.profile?.name || 'N/A';
        case 'platform': return influencer.platform || 'N/A';
        case 'followers': return influencer.profile?.followers?.toLocaleString() || 'N/A';
        case 'bio': return influencer.profile?.bio || 'N/A';
        case 'url': return influencer.url;
        case 'latestScore': return influencer.latestScore?.toString() || 'N/A';
        default: return 'N/A';
      }
    }
  }

  /**
   * 導出單個網紅的完整 PDF 報告
   */
  static async exportInfluencerPDF(data: ExportData): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // 設定中文字體支持
      pdf.setFont('helvetica', 'normal');

      // 標題
      pdf.setFontSize(20);
      pdf.setTextColor(44, 62, 80);
      pdf.text('網紅評估報告', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // 專案信息
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`專案：${data.project.name}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`生成時間：${new Date().toLocaleDateString('zh-TW')}`, 20, yPosition);
      yPosition += 20;

      // 網紅基本信息
      pdf.setFontSize(16);
      pdf.setTextColor(52, 73, 94);
      pdf.text('基本資料', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setTextColor(44, 62, 80);
      const basicInfo = [
        `姓名：${this.getInfluencerProperty(data.influencer, 'name')}`,
        `平台：${this.getInfluencerProperty(data.influencer, 'platform')}`,
        `粉絲數：${this.getInfluencerProperty(data.influencer, 'followers')}`,
        `個人簡介：${this.getInfluencerProperty(data.influencer, 'bio')}`,
        `網址：${this.getInfluencerProperty(data.influencer, 'url')}`
      ];

      basicInfo.forEach(info => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(info, 20, yPosition);
        yPosition += 7;
      });

      yPosition += 10;

      // 評估記錄
      if (data.evaluations.length > 0) {
        pdf.setFontSize(16);
        pdf.setTextColor(52, 73, 94);
        pdf.text('評估記錄', 20, yPosition);
        yPosition += 10;

        data.evaluations.slice(0, 5).forEach((evaluation, index) => {
          if (yPosition > pageHeight - 50) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(12);
          pdf.setTextColor(44, 62, 80);
          const evalDate = evaluation.createdAt instanceof Date
            ? evaluation.createdAt
            : evaluation.createdAt.toDate();
          pdf.text(`評估 ${index + 1}  (${evalDate.toLocaleDateString('zh-TW')})`, 20, yPosition);
          yPosition += 8;

          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);

          // 評分項目
          const criteria = [
            { key: 'brandFit', label: '品牌契合度' },
            { key: 'contentQuality', label: '內容品質' },
            { key: 'engagementRate', label: '互動率' },
            { key: 'audienceProfile', label: '受眾輪廓' },
            { key: 'professionalism', label: '專業度' },
            { key: 'businessAbility', label: '商業能力' },
            { key: 'brandSafety', label: '品牌安全' },
            { key: 'stability', label: '穩定性' }
          ];

          criteria.forEach(criterion => {
            const score = evaluation.scores[criterion.key as keyof EvaluationScores];
            pdf.text(`${criterion.label}: ${score}分`, 25, yPosition);
            yPosition += 5;
          });

          pdf.setFontSize(11);
          pdf.setTextColor(46, 125, 50);
          pdf.text(`總分：${evaluation.totalScore.toFixed(1)}分`, 25, yPosition);
          yPosition += 8;

          if (evaluation.notes) {
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`備註：${evaluation.notes}`, 25, yPosition);
            yPosition += 8;
          }

          yPosition += 5;
        });
      }

      // 增強分析數據
      if (data.enhancedProfile) {
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.setTextColor(52, 73, 94);
        pdf.text('深度分析', 20, yPosition);
        yPosition += 15;

        // 受眾分析
        pdf.setFontSize(12);
        pdf.setTextColor(44, 62, 80);
        pdf.text('受眾分析', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        const demographics = data.enhancedProfile.demographics;

        // 年齡分布
        pdf.text('年齡分布：', 25, yPosition);
        yPosition += 5;
        Object.entries(demographics.ageGroups).forEach(([age, percentage]) => {
          pdf.text(`${age}: ${percentage}%`, 30, yPosition);
          yPosition += 5;
        });

        yPosition += 5;

        // 地理分布
        pdf.text('主要國家/地區：', 25, yPosition);
        yPosition += 5;
        demographics.topCountries.slice(0, 3).forEach(country => {
          pdf.text(`${country.country}: ${country.percentage}%`, 30, yPosition);
          yPosition += 5;
        });

        yPosition += 10;

        // 內容分析
        pdf.setFontSize(12);
        pdf.setTextColor(44, 62, 80);
        pdf.text('內容分析', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        const content = data.enhancedProfile.content;

        pdf.text(`整體情感：${content.sentiment.overall === 'positive' ? '正面' : content.sentiment.overall === 'negative' ? '負面' : '中性'}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`品牌安全評分：${content.brandSafety.score}分`, 25, yPosition);
        yPosition += 5;
        pdf.text(`發布頻率：每週${content.postFrequency.avgPostsPerWeek.toFixed(1)}篇`, 25, yPosition);
        yPosition += 10;

        // 主要話題
        if (content.topics.length > 0) {
          pdf.text('主要話題：', 25, yPosition);
          yPosition += 5;
          content.topics.slice(0, 5).forEach(topic => {
            pdf.text(`${topic.topic} (${topic.confidence.toFixed(0)}%)`, 30, yPosition);
            yPosition += 5;
          });
        }
      }

      // 生成文件名
      const fileName = `${data.influencer.profile?.name || 'Unknown'}_評估報告_${new Date().toISOString().split('T')[0]}.pdf`;

      // 保存文件
      pdf.save(fileName);

    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('PDF 導出失敗');
    }
  }

  /**
   * 導出評估數據為 Excel 表格
   */
  static async exportEvaluationsExcel(data: ExportData): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();

      // 基本資料工作表
      const basicData = [
        ['項目', '值'],
        ['姓名', data.influencer.profile?.name || 'N/A'],
        ['平台', data.influencer.platform || 'N/A'],
        ['粉絲數', data.influencer.profile?.followers || 'N/A'],
        ['網址', data.influencer.url],
        ['個人簡介', data.influencer.profile?.bio || 'N/A'],
        ['最新評分', this.getInfluencerProperty(data.influencer, 'latestScore')],
        ['評估次數', data.evaluations.length]
      ];

      const basicSheet = XLSX.utils.aoa_to_sheet(basicData);
      XLSX.utils.book_append_sheet(workbook, basicSheet, '基本資料');

      // 評估記錄工作表
      if (data.evaluations.length > 0) {
        const evaluationHeaders = [
          '評估日期',
          '評估者',
          '品牌契合度',
          '內容品質',
          '互動率',
          '受眾輪廓',
          '專業度',
          '商業能力',
          '品牌安全',
          '穩定性',
          '總分',
          '備註'
        ];

        const evaluationData = [
          evaluationHeaders,
          ...data.evaluations.map(evaluation => {
            const evalDate = evaluation.createdAt instanceof Date
              ? evaluation.createdAt
              : evaluation.createdAt.toDate();
            return [
              evalDate.toLocaleDateString('zh-TW'),
              evaluation.evaluatedBy,
              evaluation.scores.brandFit,
              evaluation.scores.contentQuality,
              evaluation.scores.engagementRate,
              evaluation.scores.audienceProfile,
              evaluation.scores.professionalism,
              evaluation.scores.businessAbility,
              evaluation.scores.brandSafety,
              evaluation.scores.stability,
              evaluation.totalScore.toFixed(1),
              evaluation.notes || ''
            ];
          })
        ];

        const evaluationSheet = XLSX.utils.aoa_to_sheet(evaluationData);
        XLSX.utils.book_append_sheet(workbook, evaluationSheet, '評估記錄');
      }

      // 增強分析工作表
      if (data.enhancedProfile) {
        const enhanced = data.enhancedProfile;

        // 受眾分析
        const audienceData = [
          ['年齡分布'],
          ['年齡組', '百分比'],
          ...Object.entries(enhanced.demographics.ageGroups).map(([age, percent]) => [age, `${percent}%`]),
          [''],
          ['性別分布'],
          ['性別', '百分比'],
          ...Object.entries(enhanced.demographics.gender).map(([gender, percent]) => [
            gender === 'male' ? '男性' : gender === 'female' ? '女性' : '其他',
            `${percent}%`
          ]),
          [''],
          ['地理分布'],
          ['國家/地區', '百分比'],
          ...enhanced.demographics.topCountries.map(country => [country.country, `${country.percentage}%`])
        ];

        const audienceSheet = XLSX.utils.aoa_to_sheet(audienceData);
        XLSX.utils.book_append_sheet(workbook, audienceSheet, '受眾分析');

        // 內容分析
        const contentData = [
          ['內容分析'],
          ['項目', '值'],
          ['整體情感', enhanced.content.sentiment.overall === 'positive' ? '正面' : enhanced.content.sentiment.overall === 'negative' ? '負面' : '中性'],
          ['正面情感比例', `${enhanced.content.sentiment.positive}%`],
          ['中性情感比例', `${enhanced.content.sentiment.neutral}%`],
          ['負面情感比例', `${enhanced.content.sentiment.negative}%`],
          ['品牌安全評分', enhanced.content.brandSafety.score],
          ['品牌安全風險等級', enhanced.content.brandSafety.riskLevel === 'low' ? '低風險' : enhanced.content.brandSafety.riskLevel === 'high' ? '高風險' : '中等風險'],
          ['每日平均發布', enhanced.content.postFrequency.daily.toFixed(1)],
          ['每週平均發布', enhanced.content.postFrequency.avgPostsPerWeek.toFixed(1)],
          [''],
          ['主要話題'],
          ['話題', '信心度', '頻率'],
          ...enhanced.content.topics.slice(0, 10).map(topic => [topic.topic, `${topic.confidence.toFixed(0)}%`, topic.frequency])
        ];

        const contentSheet = XLSX.utils.aoa_to_sheet(contentData);
        XLSX.utils.book_append_sheet(workbook, contentSheet, '內容分析');

        // 互動分析
        const engagementData = [
          ['互動分析'],
          ['項目', '值'],
          ['平均讚數', enhanced.engagement.avgLikes.toLocaleString()],
          ['平均留言數', enhanced.engagement.avgComments.toLocaleString()],
          ['平均分享數', enhanced.engagement.avgShares.toLocaleString()],
          ['平均觀看數', enhanced.engagement.avgViews.toLocaleString()],
          ['互動率', `${enhanced.engagement.engagementRate.toFixed(1)}%`],
          ['互動質量評分', enhanced.engagement.engagementQuality.qualityScore.toFixed(0)],
          ['真實留言比例', `${enhanced.engagement.engagementQuality.genuineComments}%`],
          ['垃圾留言比例', `${enhanced.engagement.engagementQuality.spamComments}%`]
        ];

        const engagementSheet = XLSX.utils.aoa_to_sheet(engagementData);
        XLSX.utils.book_append_sheet(workbook, engagementSheet, '互動分析');
      }

      // 生成文件名
      const fileName = `${data.influencer.profile?.name || 'Unknown'}_評估數據_${new Date().toISOString().split('T')[0]}.xlsx`;

      // 導出文件
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, fileName);

    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Excel 導出失敗');
    }
  }

  /**
   * 導出比較報告為 Excel
   */
  static async exportComparisonExcel(data: ComparisonExportData): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();

      // 比較總覽工作表
      const overviewHeaders = [
        '姓名',
        '平台',
        '粉絲數',
        '最新評分',
        '評估次數',
        '品牌契合度',
        '內容品質',
        '互動率',
        '受眾輪廓',
        '專業度',
        '商業能力',
        '品牌安全',
        '穩定性'
      ];

      const overviewData = [
        overviewHeaders,
        ...data.influencers.map(influencer => {
          const evaluations = data.evaluationsMap[influencer.id] || [];
          const latestEval = evaluations[0];

          return [
            influencer.profile?.name || 'N/A',
            influencer.platform || 'N/A',
            influencer.profile?.followers?.toLocaleString() || 'N/A',
            this.getInfluencerProperty(influencer, 'latestScore'),
            evaluations.length,
            latestEval?.scores.brandFit || 'N/A',
            latestEval?.scores.contentQuality || 'N/A',
            latestEval?.scores.engagementRate || 'N/A',
            latestEval?.scores.audienceProfile || 'N/A',
            latestEval?.scores.professionalism || 'N/A',
            latestEval?.scores.businessAbility || 'N/A',
            latestEval?.scores.brandSafety || 'N/A',
            latestEval?.scores.stability || 'N/A'
          ];
        })
      ];

      const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(workbook, overviewSheet, '比較總覽');

      // 為每個網紅創建詳細工作表
      data.influencers.forEach((influencer, index) => {
        const evaluations = data.evaluationsMap[influencer.id] || [];
        if (evaluations.length === 0) return;

        const sheetName = `${influencer.profile?.name || `網紅${index + 1}`}`.substring(0, 31);

        const detailHeaders = [
          '評估日期',
          '評估者',
          '品牌契合度',
          '內容品質',
          '互動率',
          '受眾輪廓',
          '專業度',
          '商業能力',
          '品牌安全',
          '穩定性',
          '總分',
          '備註'
        ];

        const detailData = [
          detailHeaders,
          ...evaluations.map(evaluation => {
            const evalDate = evaluation.createdAt instanceof Date
              ? evaluation.createdAt
              : evaluation.createdAt.toDate();
            return [
              evalDate.toLocaleDateString('zh-TW'),
              evaluation.evaluatedBy,
              evaluation.scores.brandFit,
              evaluation.scores.contentQuality,
              evaluation.scores.engagementRate,
              evaluation.scores.audienceProfile,
              evaluation.scores.professionalism,
              evaluation.scores.businessAbility,
              evaluation.scores.brandSafety,
              evaluation.scores.stability,
              evaluation.totalScore.toFixed(1),
              evaluation.notes || ''
            ];
          })
        ];

        const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
        XLSX.utils.book_append_sheet(workbook, detailSheet, sheetName);
      });

      // 生成文件名
      const fileName = `${data.project.name}_網紅比較_${new Date().toISOString().split('T')[0]}.xlsx`;

      // 導出文件
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, fileName);

    } catch (error) {
      console.error('Comparison Excel export error:', error);
      throw new Error('比較報告導出失敗');
    }
  }

  /**
   * 導出項目總結報告
   */
  static async exportProjectSummaryPDF(
    project: Project,
    influencers: (Influencer | DemoInfluencer)[],
    evaluationsMap: { [influencerId: string]: Evaluation[] }
  ): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      // 標題
      pdf.setFontSize(20);
      pdf.setTextColor(44, 62, 80);
      pdf.text('專案總結報告', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // 專案信息
      pdf.setFontSize(14);
      pdf.setTextColor(52, 73, 94);
      pdf.text(`專案名稱：${project.name}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`生成時間：${new Date().toLocaleDateString('zh-TW')}`, 20, yPosition);
      yPosition += 20;

      // 總覽統計
      pdf.setFontSize(16);
      pdf.setTextColor(52, 73, 94);
      pdf.text('總覽統計', 20, yPosition);
      yPosition += 10;

      const totalInfluencers = influencers.length;
      const totalEvaluations = Object.values(evaluationsMap).reduce((sum, evals) => sum + evals.length, 0);
      const avgScore = influencers
        .filter(inf => ('latestScore' in inf ? inf.latestScore !== null : false))
        .reduce((sum, inf) => sum + (('latestScore' in inf ? inf.latestScore : inf.score) || 0), 0) /
        influencers.filter(inf => ('latestScore' in inf ? inf.latestScore !== null : true)).length || 0;

      pdf.setFontSize(12);
      pdf.setTextColor(44, 62, 80);
      pdf.text(`網紅總數：${totalInfluencers}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`評估總數：${totalEvaluations}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`平均評分：${avgScore.toFixed(1)} 分`, 20, yPosition);
      yPosition += 15;

      // 網紅列表
      pdf.setFontSize(16);
      pdf.setTextColor(52, 73, 94);
      pdf.text('網紅列表', 20, yPosition);
      yPosition += 10;

      influencers.forEach((influencer, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.setTextColor(44, 62, 80);
        pdf.text(`${index + 1}. ${this.getInfluencerProperty(influencer, 'name')}`, 20, yPosition);
        yPosition += 6;

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`平台：${this.getInfluencerProperty(influencer, 'platform')}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`粉絲數：${this.getInfluencerProperty(influencer, 'followers')}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`評分：${this.getInfluencerProperty(influencer, 'latestScore')}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`評估次數：${evaluationsMap[influencer.id]?.length || 0}`, 25, yPosition);
        yPosition += 10;
      });

      // 生成文件名
      const fileName = `${project.name}_專案總結_${new Date().toISOString().split('T')[0]}.pdf`;

      // 保存文件
      pdf.save(fileName);

    } catch (error) {
      console.error('Project summary PDF export error:', error);
      throw new Error('專案總結報告導出失敗');
    }
  }

  /**
   * 將 HTML 元素導出為 PDF（用於圖表等）
   */
  static async exportElementToPDF(
    elementId: string,
    fileName: string,
    title?: string
  ): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('找不到指定的元素');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      if (title) {
        pdf.setFontSize(16);
        pdf.setTextColor(44, 62, 80);
        pdf.text(title, pageWidth / 2, 20, { align: 'center' });
      }

      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const yPosition = title ? 30 : 20;

      if (imgHeight <= pageHeight - yPosition - 10) {
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      } else {
        // 如果圖片太高，需要縮放
        const scaledHeight = pageHeight - yPosition - 10;
        const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
        const xPosition = (pageWidth - scaledWidth) / 2;
        pdf.addImage(imgData, 'PNG', xPosition, yPosition, scaledWidth, scaledHeight);
      }

      pdf.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Element to PDF export error:', error);
      throw new Error('圖表導出失敗');
    }
  }
}
