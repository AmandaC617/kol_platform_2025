"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users } from 'lucide-react';
import { InfluencerComparison } from './InfluencerComparison';

interface ComparisonButtonProps {
  influencers: any[];
  selectedInfluencers?: string[];
}

export const ComparisonButton: React.FC<ComparisonButtonProps> = ({
  influencers,
  selectedInfluencers = []
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(selectedInfluencers);

  const handleShowComparison = () => {
    setSelectedForComparison(selectedInfluencers);
    setShowComparison(true);
  };

  const handleCloseComparison = () => {
    setShowComparison(false);
  };

  const canCompare = selectedInfluencers.length >= 2 && selectedInfluencers.length <= 5;

  return (
    <>
      <Button
        onClick={handleShowComparison}
        disabled={!canCompare}
        variant="outline"
        className="flex items-center gap-2"
      >
        <BarChart3 className="w-4 h-4" />
        評比分析
        <Badge variant="secondary" className="ml-1">
          {selectedInfluencers.length}/5
        </Badge>
      </Button>

      {showComparison && (
        <InfluencerComparison
          influencers={influencers.filter(inf => selectedInfluencers.includes(inf.id))}
          onClose={handleCloseComparison}
        />
      )}
    </>
  );
}; 