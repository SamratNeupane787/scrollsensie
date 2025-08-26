import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

// CORS helper function
function getCorsHeaders(origin?: string | null) {
  const allowedOrigins =
    process.env.NODE_ENV === "production"
      ? [
          "https://yourdomain.com",
          "https://www.yourdomain.com",
          // Add your production domains here
        ]
      : ["*"];

  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes("*")
      ? "*"
      : allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

// IP Geolocation function
async function getLocationFromIP(ip: string) {
  try {
    // Use a free IP geolocation service
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,timezone,isp,query`
    );
    const data = await response.json();

    if (data.status === "success") {
      return {
        country: data.countryCode,
        countryName: data.country,
        region: data.regionName,
        city: data.city,
        timezone: data.timezone,
        isp: data.isp,
        ip: data.query,
      };
    }
  } catch (error) {
    console.error("Error fetching location:", error);
  }

  // Fallback to mock data
  return {
    country: "NP",
    countryName: "Nepal",
    region: "Bagmati",
    city: "Kathmandu",
    timezone: "Asia/Kathmandu",
    isp: "Unknown",
    ip: ip,
  };
}

const trackEventSchema = z.object({
  trackerId: z.string().min(8).max(64),
  scrollDepth: z.number().min(0).max(100),
  pageUrl: z.string().url(),
  timestamp: z.number().int().positive(),
  timeOnPage: z.number().int().min(0).optional(),
  totalTimeOnPage: z.number().int().min(0).optional(),
  maxScrollDepth: z.number().min(0).max(100).optional(),
  scrollEvents: z.number().int().min(0).optional(),
  engagement: z
    .object({
      timeOnPage: z.number().int().min(0),
      maxDepth: z.number().min(0).max(100),
      scrollEvents: z.number().int().min(0),
      avgScrollSpeed: z.number().min(0),
    })
    .optional(),
  device: z
    .object({
      ua: z.string().max(512).optional(),
      width: z.number().int().positive().max(20000).optional(),
      height: z.number().int().positive().max(20000).optional(),
    })
    .partial()
    .optional(),
});

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");

  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    const body = await request.json();

    // Validate body
    const parse = trackEventSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parse.error.flatten() },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const {
      trackerId,
      scrollDepth,
      pageUrl,
      timestamp,
      timeOnPage,
      totalTimeOnPage,
      maxScrollDepth,
      scrollEvents,
      engagement,
      device,
    } = parse.data;

    // Validate tracker exists
    const { data: tracker, error: trackerErr } = await supabaseAdmin
      .from("trackers")
      .select("id")
      .eq("id", trackerId)
      .maybeSingle();

    if (trackerErr) {
      console.error("Supabase error validating tracker:", trackerErr);
      return NextResponse.json(
        { error: "Server error" },
        {
          status: 500,
          headers: {
            ...corsHeaders,
          },
        }
      );
    }

    if (!tracker) {
      return NextResponse.json(
        { error: "Unknown trackerId" },
        {
          status: 404,
          headers: {
            ...corsHeaders,
          },
        }
      );
    }

    // Insert event
    const { error: insertErr } = await supabaseAdmin
      .from("scroll_events")
      .insert({
        tracker_id: trackerId,
        scroll_depth: scrollDepth,
        page_url: pageUrl,
        occurred_at: new Date(timestamp).toISOString(),
        time_on_page: timeOnPage || null,
        total_time_on_page: totalTimeOnPage || null,
        max_scroll_depth: maxScrollDepth || null,
        scroll_events_count: scrollEvents || null,
        engagement_data: engagement ? JSON.stringify(engagement) : null,
        ua: device?.ua || null,
        viewport_w: device?.width || null,
        viewport_h: device?.height || null,
        ip_address:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
      });

    if (insertErr) {
      console.error("Supabase error inserting event:", insertErr);
      return NextResponse.json(
        { error: "Server error" },
        {
          status: 500,
          headers: {
            ...corsHeaders,
          },
        }
      );
    }

    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error processing track request:", error);
    return NextResponse.json(
      { error: "Server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}
