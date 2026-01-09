import { NextResponse } from 'next/server';
import { currentUser, auth } from '@clerk/nextjs/server';
import connect from '@/app/lib/connect';
import Sale from '@/app/Models/SaleSchema';
import { GoogleGenAI } from '@google/genai';

type Aggregates = {
  totalDeals: number;
  totalDealValue: number;
  byStatus: Record<string, { count: number; value: number }>;
  bySalesperson: Record<string, { count: number; value: number }>;
  last30DaysDeals: number;
  last30DaysValue: number;
};

//in-memory cache keyed by org/user with a content version
const analyticsCache = new Map<
  string,
  { version: string; payload: { aggregates: Aggregates; ai: AiResult } }
>();

type AiResult = {
  summary: string;
  forecast_next_30_days_amount: number;
  risks: string[];
  recommendations: string[];
};

function extractJsonFromText(text: string): string | null {
  if (!text) return null;
  const fenced = text.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  if (fenced && fenced[1]) return fenced[1].trim();
  return text.trim();
}

function normalizeAi(text: string, aggregates: Aggregates): AiResult {
  const fallback: AiResult = {
    summary: text?.slice(0, 800) || 'No summary generated.',
    forecast_next_30_days_amount: Math.round(
      aggregates.last30DaysValue ||
        aggregates.totalDealValue / Math.max(1, aggregates.totalDeals)
    ),
    risks: [],
    recommendations: [],
  };

  try {
    const extracted = extractJsonFromText(text);
    if (!extracted) return fallback;
    const obj = JSON.parse(extracted);
    return {
      summary: String(obj.summary || fallback.summary),
      forecast_next_30_days_amount: Number(
        obj.forecast_next_30_days_amount ??
          fallback.forecast_next_30_days_amount
      ),
      risks: Array.isArray(obj.risks) ? obj.risks.map(String) : [],
      recommendations: Array.isArray(obj.recommendations)
        ? obj.recommendations.map(String)
        : [],
    };
  } catch {
    return fallback;
  }
}

function parseCurrencyToNumber(value: string): number {
  if (!value) return 0;
  const numeric = value.replace(/[^0-9.-]/g, '');
  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function computeAggregates(orgId: string | null, userId: string) {
  const query = orgId
    ? { organizationId: orgId }
    : { clerkUserId: userId, organizationId: { $exists: false } };

  const sales = await Sale.find(query).sort({ createdAt: -1 });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const aggregates: Aggregates = {
    totalDeals: 0,
    totalDealValue: 0,
    byStatus: {},
    bySalesperson: {},
    last30DaysDeals: 0,
    last30DaysValue: 0,
  };

  for (const sale of sales) {
    aggregates.totalDeals += 1;
    const amount = parseCurrencyToNumber(sale.dealValue as unknown as string);
    aggregates.totalDealValue += amount;

    const statusKey = String(sale.status || 'Unknown');
    if (!aggregates.byStatus[statusKey]) {
      aggregates.byStatus[statusKey] = { count: 0, value: 0 };
    }
    aggregates.byStatus[statusKey].count += 1;
    aggregates.byStatus[statusKey].value += amount;

    const sp = String(sale.salesperson || 'Unassigned');
    if (!aggregates.bySalesperson[sp]) {
      aggregates.bySalesperson[sp] = { count: 0, value: 0 };
    }
    aggregates.bySalesperson[sp].count += 1;
    aggregates.bySalesperson[sp].value += amount;

    const createdAt = new Date(sale.createdAt as unknown as string);
    if (createdAt >= thirtyDaysAgo) {
      aggregates.last30DaysDeals += 1;
      aggregates.last30DaysValue += amount;
    }
  }

  return aggregates;
}

async function computeVersion(orgId: string | null, userId: string) {
  const query = orgId
    ? { organizationId: orgId }
    : { clerkUserId: userId, organizationId: { $exists: false } };

  const [count, latest] = await Promise.all([
    Sale.countDocuments(query),
    Sale.findOne(query).select('updatedAt').sort({ updatedAt: -1 }),
  ]);

  const ts = latest?.updatedAt
    ? new Date(latest.updatedAt as unknown as string).getTime()
    : 0;
  return `${count}:${ts}`;
}

export async function GET(req: Request) {
  try {
    await connect();

    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orgId } = await auth();

    const cacheKey = orgId ? `org:${orgId}` : `user:${user.id}`;
    const version = await computeVersion(orgId || null, user.id);

    const cached = analyticsCache.get(cacheKey);

    // If client sent If-None-Match and version matches, return 304
    const ifNoneMatch = req.headers.get('if-none-match') || '';
    if (ifNoneMatch && ifNoneMatch === version) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: version,
        },
      });
    }

    if (cached && cached.version === version) {
      return NextResponse.json(cached.payload, {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=0, must-revalidate',
          ETag: version,
        },
      });
    }

    const aggregates = await computeAggregates(orgId || null, user.id);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          aggregates,
          ai: {
            summary:
              'AI key is not configured (GEMINI_API_KEY). Showing raw aggregates only.',
            forecast_next_30_days_amount: 0,
            risks: [],
            recommendations: [],
          },
        },
        { status: 200 }
      );
    }

    const genAI = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert sales analyst. Given the following sales aggregates for a SMB sales team, produce a concise JSON with fields: summary (string, 2-3 sentences (if mentioning the amount, use the currency symbol ₹)), forecast_next_30_days_amount (number), risks (string[]; short phrases), recommendations (string[]; actionable, 4-6 items). Keep it strictly valid JSON without markdown.

AGGREGATES JSON:
${JSON.stringify(aggregates)}
`;

    let ai: AiResult | null = null;
    try {
      const result = await genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });
      const text =
        result.candidates?.[0]?.content?.parts
          ?.map((p) => p?.text || '')
          .join('') || '';
      ai = normalizeAi(text, aggregates);
    } catch (err) {
      console.error('Gemini error:', err);
      ai = {
        summary: 'AI temporarily unavailable. Showing raw aggregates only.',
        forecast_next_30_days_amount: 0,
        risks: [],
        recommendations: [],
      };
    }

    const payload = { aggregates, ai };

    analyticsCache.set(cacheKey, { version, payload });

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=0, must-revalidate',
        ETag: version,
      },
    });
  } catch (error) {
    console.error('Advanced analytics error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
