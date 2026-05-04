import Link from "next/link";
import { Button } from "@/components/ui/Button";

type ResultActionsProps = {
  familyMessage?: string;
};

export function ResultActions({ familyMessage }: ResultActionsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Link href="/analyze" style={{ textDecoration: "none" }}>
        <Button variant="primary" fullWidth>
          다시 분석하기
        </Button>
      </Link>
      <Link href="/" style={{ textDecoration: "none" }}>
        <Button variant="secondary" fullWidth>
          홈으로
        </Button>
      </Link>
    </div>
  );
}
