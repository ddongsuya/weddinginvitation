// Calendar event endpoint — returns an RFC 5545 iCalendar (.ics) file.
//
// Why .ics: it's the universal calendar interchange format. iOS opens
// it with Apple Calendar's "Add Event" sheet, Android opens whatever
// calendar app the user set as default — both via the OS's native
// handler, with no assumption about which calendar service the guest
// uses (per user's "구글 캘린더 말고 안드로이드와 ios 각 기본 캘린더
// 앱으로 연결" request).
//
// Why this lives under /api/calendar instead of /calendar: the bare
// /calendar URL is now an HTML landing page that gives the guest an
// explicit "캘린더에 추가" button. Direct .ics downloads from inside
// KakaoTalk's in-app browser sometimes just drop the file in the
// device's Downloads folder without ever triggering the system's
// "Add to Calendar" handler, which is what made guests think the
// button was broken.

import { weddingData } from "@/lib/data";

export const dynamic = "force-static";

function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n/g, "\\n")
    .replace(/\n/g, "\\n");
}

function buildIcs(): string {
  const title = `${weddingData.groom.name} ♥ ${weddingData.bride.name} 결혼식`;
  const description = `${weddingData.date.display}\n${weddingData.venue.name} ${weddingData.venue.hall}`;
  const location = `${weddingData.venue.name}, ${weddingData.venue.address}`;

  // 2026-08-29 12:30 KST = 03:30 UTC; 2-hour duration.
  const dtstart = "20260829T033000Z";
  const dtend = "20260829T053000Z";
  const dtstamp = "20260101T000000Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:wedding-2026-jungmo-hwahyung@weddinginvitation-seven-dusky.vercel.app",
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeIcs(title)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // RFC 5545 requires CRLF line endings + a trailing newline.
  return lines.join("\r\n") + "\r\n";
}

export async function GET(): Promise<Response> {
  const ics = buildIcs();
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wedding.ics"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
