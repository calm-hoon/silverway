import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ODSAY_API_KEY ?? "";
  const masked = apiKey
    ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)} (length: ${apiKey.length})`
    : "(없음)";

  const encoded = encodeURIComponent(apiKey);
  const encodedMasked = encoded
    ? `${encoded.slice(0, 4)}...${encoded.slice(-4)} (length: ${encoded.length})`
    : "(없음)";

  const url =
    `https://api.odsay.com/v1/api/searchPubTransPathT` +
    `?SX=127.3845&SY=36.3504&EX=127.3641&EY=36.3681` +
    `&apiKey=${encoded}`;

  let odsayRaw: unknown = null;
  let httpStatus: number | null = null;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "Referer": "https://silverway.codegenie.co.kr/",
        "User-Agent": "Mozilla/5.0",
      },
    });
    httpStatus = res.status;
    odsayRaw = await res.json();
  } catch (e) {
    odsayRaw = { fetchError: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json({
    keyMasked: masked,
    encodedMasked,
    httpStatus,
    odsayResponse: odsayRaw,
  });
}
