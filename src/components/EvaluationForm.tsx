"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { FirebaseService } from "@/lib/firebase-service";
import { EVALUATION_CRITERIA, EvaluationScores, Project, Influencer } from "@/types";

interface EvaluationFormProps {
  project: Project;
  influencer: Influencer;
  onEvaluationSubmitted: () => void;
}

export const EvaluationForm = ({ project, influencer, onEvaluationSubmitted }: EvaluationFormProps) => {
  const { user } = useAuth();
  const [scores, setScores] = useState<EvaluationScores>({
    brandFit: 50,
    contentQuality: 50,
    engagementRate: 50,
    audienceProfile: 50,
    professionalism: 50,
    businessAbility: 50,
    brandSafety: 50,
    stability: 50
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScoreChange = (criterionId: keyof EvaluationScores, value: number[]) => {
    setScores(prev => ({
      ...prev,
      [criterionId]: value[0]
    }));
  };

  const calculateTotalScore = () => {
    let totalScore = 0;
    EVALUATION_CRITERIA.forEach(criterion => {
      totalScore += scores[criterion.id as keyof EvaluationScores] * criterion.weight;
    });
    return totalScore;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const totalScore = calculateTotalScore();

      await FirebaseService.createEvaluation(
        user.uid,
        project.id,
        influencer.id,
        scores,
        totalScore,
        notes.trim(),
        user.uid
      );

      // Reset form
      setScores({
        brandFit: 50,
        contentQuality: 50,
        engagementRate: 50,
        audienceProfile: 50,
        professionalism: 50,
        businessAbility: 50,
        brandSafety: 50,
        stability: 50
      });
      setNotes("");

      alert(`✅ 評估已成功保存！\n最終分數: ${totalScore.toFixed(2)} 分\n數據已自動儲存到系統中`);
      onEvaluationSubmitted();

    } catch (error) {
      console.error("Failed to submit evaluation:", error);
      alert("❌ 評估保存失敗，請檢查網路連線後重試。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h4 className="text-xl font-bold mb-4">評估指標</h4>
      <form onSubmit={handleSubmit} className="space-y-6">
        {EVALUATION_CRITERIA.map(criterion => (
          <div key={criterion.id}>
            <Label className="block text-md font-medium text-gray-700">
              {criterion.name} ({(criterion.weight * 100).toFixed(0)}%)
            </Label>
            <p className="text-xs text-gray-500 mb-2">{criterion.description}</p>
            <div className="flex items-center space-x-4">
              <Slider
                value={[scores[criterion.id as keyof EvaluationScores]]}
                onValueChange={(value) => handleScoreChange(criterion.id as keyof EvaluationScores, value)}
                max={100}
                min={0}
                step={1}
                className="flex-1"
              />
              <span className="font-bold text-blue-600 w-12 text-center">
                {scores[criterion.id as keyof EvaluationScores]}
              </span>
            </div>
          </div>
        ))}

        <div className="pt-4">
          <Label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            備註
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1"
            placeholder="請輸入評估備註..."
          />
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">預計總分:</span>
            <span className="text-2xl font-bold text-blue-600">
              {calculateTotalScore().toFixed(2)}
            </span>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? "💾 保存中..." : "💾 儲存評估"}
          </Button>
        </div>
      </form>
    </div>
  );
};
