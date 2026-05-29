// Calendar event endpoint — returns an RFC 5545 iCalendar (.ics) file.
//
// Why .ics instead of Google Calendar's `/render?action=TEMPLATE` URL:
//   - KakaoTalk's button-link policy blocks external domains; only URLs
//     on the registered app domain pass through, so a google.com link
//     gets silently rewritten to our homepage. By serving the calendar
//     from `/calendar` we stay on-domain.
//   - .ics is the universal calendar interchange format. iOS opens it
//     with Apple Calendar, Android opens it with Google Calendar (or
//     whichever calendar app the user set as default) — both via the
//     OS's native "Add to Calendar" sheet. No assumptions about which
//     calendar service the guest uses.
//
// Bump UID if the event ever moves; calendar apps de-dupe by UID.

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

  // 2026-08-29 12:30 KST = 03:30 UTC; 2-hour duration ends at 05:30 UTC.
  // Times encoded in UTC so the event lands at 12:30 local time for any
  // viewer regardless of the device timezone Calendar reads from.
  const dtstart = "20260829T033000Z";
  const dtend = "20260829T053000Z";
  // Fixed timestamp for the iCal record's creation; using the wedding's
  // announcement month so the file stays byte-stable across rebuilds
  // (avoids spurious "event updated" notifications on subscribers).
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
      // Filename ASCII-only so every browser/in-app webview can save it.
      "Content-Disposition": 'attachment; filename="wedding.ics"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
