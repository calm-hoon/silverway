import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getTransitRoute } from "@/lib/odsay/getTransitRoute";

// 대덕구청 → 대전역 좌표
const VALID_INPUT = {
  originLat: 36.3467,
  originLng: 127.4155,
  destinationLat: 36.3326,
  destinationLng: 127.4344,
};

const MOCK_API_KEY = "dGVzdC1rZXk+Ly89abc";

// 최소 ODsay 성공 응답
const ODSAY_SUCCESS_BODY = {
  result: {
    path: [
      {
        info: { totalTime: 30, busTransitCount: 0, subwayTransitCount: 1 },
        subPath: [
          { trafficType: 3, sectionTime: 5, distance: 300 },
          {
            trafficType: 1,
            sectionTime: 20,
            distance: 3200,
            lane: [{ name: "대전 1호선" }],
            startName: "대덕구청역",
            endName: "대전역",
          },
          { trafficType: 3, sectionTime: 5, distance: 300 },
        ],
      },
    ],
  },
};

function makeJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function makeTextResponse(text: string, status: number): Response {
  return new Response(text, { status });
}

describe("getTransitRoute — fetch mock 기반 테스트", () => {
  let savedKey: string | undefined;

  beforeEach(() => {
    savedKey = process.env.ODSAY_API_KEY;
    process.env.ODSAY_API_KEY = MOCK_API_KEY;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    if (savedKey === undefined) {
      delete process.env.ODSAY_API_KEY;
    } else {
      process.env.ODSAY_API_KEY = savedKey;
    }
    vi.unstubAllGlobals();
  });

  describe("좌표 매핑 — SX=lng, SY=lat, EX=lng, EY=lat", () => {
    it("origin.lng → SX, origin.lat → SY 순서로 URL이 구성된다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse({ result: { path: [] } }));

      await getTransitRoute(VALID_INPUT);

      const url = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(url).toContain("SX=127.4155");
      expect(url).toContain("SY=36.3467");
      expect(url).toContain("EX=127.4344");
      expect(url).toContain("EY=36.3326");
    });

    it("위도·경도가 바뀌어 전달되지 않는다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse({ result: { path: [] } }));

      await getTransitRoute(VALID_INPUT);

      const url = vi.mocked(fetch).mock.calls[0][0] as string;
      // 한국 위도(33~38)가 X(SX/EX)에 들어가지 않는다
      expect(url).not.toContain("SX=36.3467");
      expect(url).not.toContain("EX=36.3326");
      // 한국 경도(124~132)가 Y(SY/EY)에 들어가지 않는다
      expect(url).not.toContain("SY=127.4155");
      expect(url).not.toContain("EY=127.4344");
    });

    it("apiKey가 인코딩 없이 raw로 URL에 포함된다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse({ result: { path: [] } }));

      await getTransitRoute(VALID_INPUT);

      const url = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(url).toContain(`apiKey=${MOCK_API_KEY}`);
      // %2B 등 인코딩된 형태가 아니어야 한다
      expect(url).not.toContain("apiKey=dGVzdC1rZXk%2B");
    });
  });

  describe("API key / 좌표 검증", () => {
    it("ODSAY_API_KEY가 없으면 fetch를 호출하지 않고 ODSAY_API_KEY_MISSING을 반환한다", async () => {
      delete process.env.ODSAY_API_KEY;

      const result = await getTransitRoute(VALID_INPUT);

      expect(vi.mocked(fetch)).not.toHaveBeenCalled();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("ODSAY_API_KEY_MISSING");
    });

    it("잘못된 좌표이면 fetch를 호출하지 않고 INVALID_COORDINATES를 반환한다", async () => {
      const result = await getTransitRoute({
        originLat: NaN,
        originLng: NaN,
        destinationLat: NaN,
        destinationLng: NaN,
      });

      expect(vi.mocked(fetch)).not.toHaveBeenCalled();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("INVALID_COORDINATES");
    });

    it("좌표가 0이면 INVALID_COORDINATES를 반환한다", async () => {
      const result = await getTransitRoute({
        originLat: 0,
        originLng: 0,
        destinationLat: 0,
        destinationLng: 0,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("INVALID_COORDINATES");
    });
  });

  describe("HTTP 오류 — reason 구분", () => {
    it("HTTP 401이면 ODSAY_HTTP_ERROR_STATUS_401을 반환한다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeTextResponse("Unauthorized", 401));

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("ODSAY_HTTP_ERROR_STATUS_401");
    });

    it("HTTP 403이면 ODSAY_HTTP_ERROR_STATUS_403을 반환한다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeTextResponse("Forbidden", 403));

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("ODSAY_HTTP_ERROR_STATUS_403");
    });

    it("HTTP 429이면 ODSAY_HTTP_ERROR_STATUS_429을 반환한다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeTextResponse("Too Many Requests", 429));

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("ODSAY_HTTP_ERROR_STATUS_429");
    });

    it("HTTP 500이면 ODSAY_HTTP_ERROR_STATUS_500을 반환한다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeTextResponse("Internal Server Error", 500));

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("ODSAY_HTTP_ERROR_STATUS_500");
    });

    it("HTTP 오류 시 fallback transit이 반환된다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeTextResponse("Forbidden", 403));

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.transit).toBeDefined();
      expect(result.transit.available).toBeDefined();
    });
  });

  describe("ODsay error 응답 파싱", () => {
    it("top-level error code/msg가 있으면 reason에 포함된다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        makeJsonResponse({ error: { code: "-8", msg: "인증 실패" } })
      );

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toContain("-8");
        expect(result.reason).not.toBe("");
      }
    });

    it("result.error 구조의 오류도 파싱된다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        makeJsonResponse({ result: { error: { code: "-98", msg: "서비스 지역 아님" } } })
      );

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toContain("-98");
        expect(result.reason).not.toBe("");
      }
    });

    it("error 객체에 code/msg가 비어 있어도 빈 문자열 reason이 되지 않는다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        makeJsonResponse({ error: {} })
      );

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBeTruthy();
        expect(result.reason).not.toBe("");
        expect(result.reason).not.toBe("ODsay error code= msg=");
      }
    });

    it("경로가 없으면 ODSAY_NO_ROUTE_FOUND를 반환한다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        makeJsonResponse({ result: { path: [] } })
      );

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("ODSAY_NO_ROUTE_FOUND");
    });

    it("JSON 파싱 실패 시 ODSAY_PARSE_ERROR를 반환한다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response("not valid json {{{", { status: 200 })
      );

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("ODSAY_PARSE_ERROR");
    });
  });

  describe("네트워크 오류", () => {
    it("timeout(AbortError) 시 ODSAY_TIMEOUT을 반환한다", async () => {
      const abortErr = new Error("The operation was aborted");
      abortErr.name = "AbortError";
      vi.mocked(fetch).mockRejectedValueOnce(abortErr);

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("ODSAY_TIMEOUT");
    });

    it("fetch 자체 실패 시 ODSAY_FETCH_FAILED를 반환한다", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toContain("ODSAY_FETCH_FAILED");
    });

    it("오류 발생 시 fallback transit이 반환된다", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.transit).toBeDefined();
    });
  });

  describe("성공 응답", () => {
    it("성공 시 ok:true, source:ODSAY를 반환한다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse(ODSAY_SUCCESS_BODY));

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.ok).toBe(true);
      expect(result.source).toBe("ODSAY");
    });

    it("성공 시 transit.route.steps가 포함된다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse(ODSAY_SUCCESS_BODY));

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.transit.route?.steps.length).toBeGreaterThan(0);
    });

    it("성공 시 SUBWAY step에 stationFrom이 포함된다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse(ODSAY_SUCCESS_BODY));

      const result = await getTransitRoute(VALID_INPUT);

      const subway = result.transit.route?.steps.find((s) => s.mode === "SUBWAY");
      expect(subway?.stationFrom).toBe("대덕구청역");
    });

    it("성공 시 transit.route.source에 ODsay 표시가 있다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse(ODSAY_SUCCESS_BODY));

      const result = await getTransitRoute(VALID_INPUT);

      expect(result.transit.route?.source).toContain("ODsay");
    });
  });

  describe("보안 — API key 비노출", () => {
    it("응답 JSON 문자열에 API key가 포함되지 않는다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse(ODSAY_SUCCESS_BODY));

      const result = await getTransitRoute(VALID_INPUT);
      const text = JSON.stringify(result);

      expect(text).not.toContain(MOCK_API_KEY);
      expect(text).not.toContain("apiKey=");
    });

    it("오류 응답 JSON에도 API key가 포함되지 않는다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeTextResponse("error", 403));

      const result = await getTransitRoute(VALID_INPUT);
      const text = JSON.stringify(result);

      expect(text).not.toContain(MOCK_API_KEY);
    });
  });

  describe("금지 표현", () => {
    const FORBIDDEN = ["시연용", "Mock", "MOCK", "더미", "사고 확률", "예측 확률", "probability", "실시간 혼잡도", "반드시 반납", "운전 금지"];

    it("성공 응답 텍스트에 금지 표현이 없다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeJsonResponse(ODSAY_SUCCESS_BODY));

      const result = await getTransitRoute(VALID_INPUT);
      const text = [
        result.transit.congestion?.description ?? "",
        ...(result.transit.route?.steps.map((s) => s.description) ?? []),
        result.transit.route?.source ?? "",
      ].join(" ");

      for (const word of FORBIDDEN) {
        expect(text, `금지 표현 "${word}" 발견`).not.toContain(word);
      }
    });

    it("fallback 응답 텍스트에 금지 표현이 없다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(makeTextResponse("Forbidden", 403));

      const result = await getTransitRoute(VALID_INPUT);
      const text = [
        result.transit.congestion?.description ?? "",
        ...(result.transit.route?.steps.map((s) => s.description) ?? []),
      ].join(" ");

      for (const word of FORBIDDEN) {
        expect(text, `금지 표현 "${word}" 발견`).not.toContain(word);
      }
    });
  });
});
