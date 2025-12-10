import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const url =
      (formData.get("url") as string) || (formData.get("text") as string);

    if (!url) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Redirect to home with URL in query params
    const homeUrl = new URL("/", req.url);
    homeUrl.searchParams.set("url", url);

    return NextResponse.redirect(homeUrl);
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
