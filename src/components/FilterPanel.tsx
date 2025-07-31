"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { InfluencerFilters } from "@/types";
import { Search, Filter, X, RotateCcw } from "lucide-react";

interface FilterPanelProps {
  filters: InfluencerFilters;
  onFiltersChange: (filters: InfluencerFilters) => void;
  activeFilterCount: number;
}

const PLATFORMS = [
  { value: "Instagram", label: "Instagram", color: "bg-pink-100 text-pink-800" },
  { value: "YouTube", label: "YouTube", color: "bg-red-100 text-red-800" },
  { value: "TikTok", label: "TikTok", color: "bg-purple-100 text-purple-800" },
  { value: "Facebook", label: "Facebook", color: "bg-blue-100 text-blue-800" },
  { value: "Twitter", label: "Twitter", color: "bg-gray-100 text-gray-800" },
];

const FOLLOWER_RANGES = [
  { label: "1K - 10K", min: 1000, max: 10000 },
  { label: "10K - 100K", min: 10000, max: 100000 },
  { label: "100K - 1M", min: 100000, max: 1000000 },
  { label: "1M+", min: 1000000, max: 10000000 },
];

const SAMPLE_TAGS = [
  "美妝", "時尚", "生活", "美食", "旅遊", "科技", "健身", "親子",
  "寵物", "音樂", "藝術", "學習", "創業", "投資", "心靈成長"
];

export const FilterPanel = ({ filters, onFiltersChange, activeFilterCount }: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (updates: Partial<InfluencerFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handlePlatformToggle = (platform: string) => {
    const updatedPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform];
    updateFilters({ platforms: updatedPlatforms });
  };

  const handleTagToggle = (tag: string) => {
    const updatedTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: updatedTags });
  };

  const handleFollowerRangeChange = (values: number[]) => {
    updateFilters({
      followerRange: {
        min: values[0],
        max: values[1]
      }
    });
  };

  const handleScoreRangeChange = (values: number[]) => {
    updateFilters({
      scoreRange: {
        min: values[0],
        max: values[1]
      }
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      searchQuery: "",
      platforms: [],
      followerRange: { min: 0, max: 10000000 },
      scoreRange: { min: 0, max: 100 },
      tags: [],
      hasEvaluation: undefined
    });
  };

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  return (
    <>
      {/* Mobile Filter Trigger */}
      <div className="lg:hidden mb-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>篩選條件</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>篩選條件</SheetTitle>
            </SheetHeader>
            <FilterContent
              filters={filters}
              updateFilters={updateFilters}
              handlePlatformToggle={handlePlatformToggle}
              handleTagToggle={handleTagToggle}
              handleFollowerRangeChange={handleFollowerRangeChange}
              handleScoreRangeChange={handleScoreRangeChange}
              resetFilters={resetFilters}
              formatFollowerCount={formatFollowerCount}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter Panel */}
      <div className="hidden lg:block">
        <FilterContent
          filters={filters}
          updateFilters={updateFilters}
          handlePlatformToggle={handlePlatformToggle}
          handleTagToggle={handleTagToggle}
          handleFollowerRangeChange={handleFollowerRangeChange}
          handleScoreRangeChange={handleScoreRangeChange}
          resetFilters={resetFilters}
          formatFollowerCount={formatFollowerCount}
        />
      </div>
    </>
  );
};

interface FilterContentProps {
  filters: InfluencerFilters;
  updateFilters: (updates: Partial<InfluencerFilters>) => void;
  handlePlatformToggle: (platform: string) => void;
  handleTagToggle: (tag: string) => void;
  handleFollowerRangeChange: (values: number[]) => void;
  handleScoreRangeChange: (values: number[]) => void;
  resetFilters: () => void;
  formatFollowerCount: (count: number) => string;
}

const FilterContent = ({
  filters,
  updateFilters,
  handlePlatformToggle,
  handleTagToggle,
  handleFollowerRangeChange,
  handleScoreRangeChange,
  resetFilters,
  formatFollowerCount
}: FilterContentProps) => {
  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            關鍵字搜尋
            {filters.searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilters({ searchQuery: "" })}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋網紅姓名..."
              value={filters.searchQuery}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Platform Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            平台篩選
            {filters.platforms.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilters({ platforms: [] })}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-2">
            {PLATFORMS.map((platform) => (
              <div key={platform.value} className="flex items-center space-x-2">
                <Checkbox
                  id={platform.value}
                  checked={filters.platforms.includes(platform.value)}
                  onCheckedChange={() => handlePlatformToggle(platform.value)}
                />
                <Label
                  htmlFor={platform.value}
                  className="flex-1 text-sm font-normal cursor-pointer"
                >
                  <Badge variant="outline" className={platform.color}>
                    {platform.label}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Follower Range Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">粉絲數範圍</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="px-2">
            <Slider
              value={[filters.followerRange.min, filters.followerRange.max]}
              onValueChange={handleFollowerRangeChange}
              min={0}
              max={10000000}
              step={1000}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatFollowerCount(filters.followerRange.min)}</span>
            <span>{formatFollowerCount(filters.followerRange.max)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FOLLOWER_RANGES.map((range) => (
              <Button
                key={range.label}
                variant="outline"
                size="sm"
                onClick={() => handleFollowerRangeChange([range.min, range.max])}
                className="text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Score Range Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">評分區間</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="px-2">
            <Slider
              value={[filters.scoreRange.min, filters.scoreRange.max]}
              onValueChange={handleScoreRangeChange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{filters.scoreRange.min}分</span>
            <span>{filters.scoreRange.max}分</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleScoreRangeChange([80, 100])}
              className="text-xs"
            >
              優秀 (80+)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleScoreRangeChange([60, 79])}
              className="text-xs"
            >
              良好 (60-79)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleScoreRangeChange([0, 59])}
              className="text-xs"
            >
              待改善 (&lt;60)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tags Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            標籤篩選
            {filters.tags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilters({ tags: [] })}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TAGS.map((tag) => (
              <Button
                key={tag}
                variant={filters.tags.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => handleTagToggle(tag)}
                className="text-xs h-7"
              >
                {tag}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Status Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">評估狀態</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select
            value={filters.hasEvaluation === undefined ? "all" : filters.hasEvaluation ? "evaluated" : "not-evaluated"}
            onValueChange={(value) => {
              updateFilters({
                hasEvaluation: value === "all" ? undefined : value === "evaluated"
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="選擇評估狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="evaluated">已評估</SelectItem>
              <SelectItem value="not-evaluated">未評估</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <Button
        variant="outline"
        onClick={resetFilters}
        className="w-full flex items-center justify-center space-x-2"
      >
        <RotateCcw className="w-4 h-4" />
        <span>清除所有篩選</span>
      </Button>
    </div>
  );
};
