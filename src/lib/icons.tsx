import React from "react";

type IconProps = { className?: string; color?: string };
type Child = [string, Record<string, string | number>];

function icon(data: Child[]) {
  return function Icon({ className, color }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color ?? "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {data.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
      </svg>
    );
  };
}

export const ArrowUpRight = icon([["path", { d: "M7 7h10v10" }], ["path", { d: "M7 17 17 7" }]]);
export const ChevronRight = icon([["path", { d: "m9 18 6-6-6-6" }]]);
export const ChevronLeft = icon([["path", { d: "m15 18-6-6 6-6" }]]);
export const ChevronDown = icon([["path", { d: "m6 9 6 6 6-6" }]]);
export const Check = icon([["path", { d: "M20 6 9 17l-5-5" }]]);
export const Copy = icon([
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }],
]);
export const Globe = icon([
  ["circle", { cx: "12", cy: "12", r: "10" }],
  ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }],
  ["path", { d: "M2 12h20" }],
]);
export const GlobeIcon = Globe;
export const Mail = icon([
  ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" }],
  ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2" }],
]);
export const MailIcon = Mail;
export const House = icon([
  ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }],
  ["path", { d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }],
]);
export const Library = icon([
  ["path", { d: "m16 6 4 14" }],
  ["path", { d: "M12 6v14" }],
  ["path", { d: "M8 8v12" }],
  ["path", { d: "M4 4v16" }],
]);
export const CircuitBoard = icon([
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }],
  ["path", { d: "M11 9h4a2 2 0 0 0 2-2V3" }],
  ["circle", { cx: "9", cy: "9", r: "2" }],
  ["path", { d: "M7 21v-4a2 2 0 0 1 2-2h4" }],
  ["circle", { cx: "15", cy: "15", r: "2" }],
]);
export const Code2 = icon([
  ["path", { d: "m18 16 4-4-4-4" }],
  ["path", { d: "m6 8-4 4 4 4" }],
  ["path", { d: "m14.5 4-5 16" }],
]);
export const Cpu = icon([
  ["path", { d: "M12 20v2" }], ["path", { d: "M12 2v2" }],
  ["path", { d: "M17 20v2" }], ["path", { d: "M17 2v2" }],
  ["path", { d: "M2 12h2" }], ["path", { d: "M2 17h2" }], ["path", { d: "M2 7h2" }],
  ["path", { d: "M20 12h2" }], ["path", { d: "M20 17h2" }], ["path", { d: "M20 7h2" }],
  ["path", { d: "M7 20v2" }], ["path", { d: "M7 2v2" }],
  ["rect", { x: "4", y: "4", width: "16", height: "16", rx: "2" }],
  ["rect", { x: "8", y: "8", width: "8", height: "8", rx: "1" }],
]);
export const ShieldCheck = icon([
  ["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }],
  ["path", { d: "m9 12 2 2 4-4" }],
]);
export const Factory = icon([
  ["path", { d: "M12 16h.01" }], ["path", { d: "M16 16h.01" }],
  ["path", { d: "M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" }],
  ["path", { d: "M8 16h.01" }],
]);
export const Wrench = icon([
  ["path", { d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" }],
]);
export const Handshake = icon([
  ["path", { d: "m11 17 2 2a1 1 0 1 0 3-3" }],
  ["path", { d: "m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" }],
  ["path", { d: "m21 3 1 11h-2" }],
  ["path", { d: "M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" }],
  ["path", { d: "M3 4h8" }],
]);
export const Kanban = icon([
  ["path", { d: "M5 3v14" }], ["path", { d: "M12 3v8" }], ["path", { d: "M19 3v18" }],
]);
export const Users = icon([
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }],
  ["circle", { cx: "9", cy: "7", r: "4" }],
]);
export const TrendingUp = icon([
  ["path", { d: "M16 7h6v6" }],
  ["path", { d: "m22 7-8.5 8.5-5-5L2 17" }],
]);
export const BarChart2 = icon([
  ["path", { d: "M5 21v-6" }], ["path", { d: "M12 21V3" }], ["path", { d: "M19 21V9" }],
]);
export const Plane = icon([
  ["path", { d: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" }],
]);
export const Rocket = icon([
  ["path", { d: "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" }],
  ["path", { d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09" }],
  ["path", { d: "M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z" }],
  ["path", { d: "M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05" }],
]);
export const Zap = icon([
  ["path", { d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" }],
]);
export const Gauge = icon([
  ["path", { d: "m12 14 4-4" }],
  ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0" }],
]);
export const Music = icon([
  ["path", { d: "M9 18V5l12-2v13" }],
  ["circle", { cx: "6", cy: "18", r: "3" }],
  ["circle", { cx: "18", cy: "16", r: "3" }],
]);
export const Tv2 = icon([
  ["path", { d: "M7 21h10" }],
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2" }],
]);
export const Hammer = icon([
  ["path", { d: "m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9" }],
  ["path", { d: "m18 15 4-4" }],
  ["path", { d: "m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5" }],
]);
export const BookOpen = icon([
  ["path", { d: "M12 7v14" }],
  ["path", { d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" }],
]);
export const Camera = icon([
  ["path", { d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" }],
  ["circle", { cx: "12", cy: "13", r: "3" }],
]);
