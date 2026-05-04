type ResultDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ResultDetailPage({ params }: ResultDetailPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <section className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-blue-700">/result/[id]</p>
        <h1 className="text-3xl font-bold">분석 결과 상세 Placeholder</h1>
        <p className="leading-7 text-slate-600">
          resultId <span className="font-semibold text-slate-900">{id}</span>에 해당하는 분석 결과를 표시할 예정입니다.
          이번 작업에서는 Supabase 조회를 구현하지 않습니다.
        </p>
      </section>
    </main>
  );
}
