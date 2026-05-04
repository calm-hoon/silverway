import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <section className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-blue-700">SilverWay MVP</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            AI 기반 고령자 이동 및 면허 반납 의사결정 지원 서비스
          </h1>
          <p className="text-lg leading-8 text-slate-600">
            SilverWay는 공공데이터, 기상 정보, 대중교통 경로, 과거 패턴 기반 예측형 혼잡도를 활용해
            고령자의 이동 선택을 돕는 서비스입니다.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm leading-6 text-slate-600">
            현재 단계는 Next.js 프로젝트 초기화 작업입니다. 실제 API 연동, Supabase query, 회원가입/auth,
            복잡한 UI는 아직 구현하지 않았습니다.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/analyze"
            className="rounded-xl bg-blue-700 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800"
          >
            분석 입력 페이지 보기
          </Link>
          <Link
            href="/result/test"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            테스트 결과 페이지 보기
          </Link>
        </div>
      </section>
    </main>
  );
}
