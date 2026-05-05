import { type AnalysisResult } from "@/types";
import { MapSection } from "@/components/map/MapSection";
import { ResultSummary } from "./ResultSummary";
import { DrivingRiskCard } from "./DrivingRiskCard";
import { RiskFactorList } from "./RiskFactorList";
import { TransitAlternativeCard } from "./TransitAlternativeCard";
import { CongestionCard } from "./CongestionCard";
import { WeatherSummaryCard } from "./WeatherSummaryCard";
import { FamilyReportCard } from "./FamilyReportCard";
import { DataSourceCard } from "./DataSourceCard";
import { ResultActions } from "./ResultActions";

type ResultPageViewProps = {
  analysis: AnalysisResult;
};

export function ResultPageView({ analysis }: ResultPageViewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ResultSummary analysis={analysis} />

      <DrivingRiskCard risk={analysis.drivingRisk} />

      {analysis.drivingRisk.factors.length > 0 && (
        <RiskFactorList factors={analysis.drivingRisk.factors} />
      )}

      <MapSection analysis={analysis} />

      <TransitAlternativeCard transit={analysis.transit} />

      <CongestionCard congestion={analysis.transit.congestion} />

      <WeatherSummaryCard weather={analysis.weather} />

      <FamilyReportCard report={analysis.report} />

      <DataSourceCard
        sources={analysis.dataSources}
        fallbackFlags={analysis.fallbackFlags}
      />

      <div style={{ paddingTop: 8 }}>
        <ResultActions familyMessage={analysis.report.familyMessage} />
      </div>
    </div>
  );
}
