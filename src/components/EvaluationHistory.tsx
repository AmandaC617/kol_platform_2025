"use client";

import { useEffect, useState, useRef } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from "@/contexts/AuthContext";
import { FirebaseService } from "@/lib/firebase-service";
import { EVALUATION_CRITERIA, Evaluation, Project, Influencer } from "@/types";
import { Unsubscribe } from "firebase/firestore";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface EvaluationHistoryProps {
  project: Project;
  influencer: Influencer;
}

export const EvaluationHistory = ({ project, influencer }: EvaluationHistoryProps) => {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const chartRef = useRef<ChartJS<"line", number[], string>>(null);

  useEffect(() => {
    if (!user) return;

    let unsubscribe: Unsubscribe;

    const loadEvaluations = async () => {
      unsubscribe = FirebaseService.subscribeToEvaluations(
        user.uid,
        project.id,
        influencer.id,
        (evaluationsData) => {
          setEvaluations(evaluationsData);
        }
      );
    };

    loadEvaluations();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, project.id, influencer.id]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-200 text-green-800';
    if (score >= 60) return 'bg-yellow-200 text-yellow-800';
    return 'bg-red-200 text-red-800';
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return 'N/A';

    let date: Date;
    // Handle Firebase Timestamp
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp && typeof (timestamp as { toDate: () => Date }).toDate === 'function') {
      date = (timestamp as { toDate: () => Date }).toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return 'N/A';
    }

    return date.toLocaleString('zh-TW');
  };

  const getChartData = () => {
    if (evaluations.length === 0) return null;

    const reversedEvals = [...evaluations].reverse();

    return {
      labels: reversedEvals.map(e => formatDate(e.createdAt).split(' ')[0]), // Only date part
      datasets: [{
        label: '歷史總分趨勢',
        data: reversedEvals.map(e => e.totalScore),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '評估分數趨勢圖'
      }
    }
  };

  const chartData = getChartData();

  return (
    <div className="p-6 bg-gray-50 border-t">
      <h4 className="text-xl font-bold mb-4">歷史評估紀錄</h4>

      {/* Chart */}
      {chartData && evaluations.length > 1 && (
        <div className="mb-6 h-64 bg-white p-4 rounded-lg shadow-sm">
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        </div>
      )}

      {/* History List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 no-scrollbar">
        {evaluations.length === 0 ? (
          <p className="text-center text-gray-500 p-4">尚無評估紀錄。</p>
        ) : (
          evaluations.map((evaluation) => (
            <div key={evaluation.id} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center">
                <p className="font-bold text-lg">
                  總分:
                  <span className={`px-2 py-1 rounded ml-2 ${getScoreColor(evaluation.totalScore)}`}>
                    {evaluation.totalScore.toFixed(2)}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(evaluation.createdAt)}
                </p>
              </div>

              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                  顯示詳細分數與備註
                </summary>
                <div className="mt-2 pt-2 border-t text-sm space-y-1">
                  {Object.entries(evaluation.scores).map(([key, value]) => {
                    const criterion = EVALUATION_CRITERIA.find(c => c.id === key);
                    return (
                      <p key={key}>
                        {criterion?.name || key}:
                        <span className="font-semibold ml-1">{value}</span>
                      </p>
                    );
                  })}
                  <div className="mt-2 pt-2 border-t">
                    <p><strong>備註:</strong> {evaluation.notes || '無'}</p>
                  </div>
                </div>
              </details>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
