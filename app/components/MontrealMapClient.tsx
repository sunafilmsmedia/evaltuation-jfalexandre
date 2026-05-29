"use client";

import dynamic from "next/dynamic";

const MontrealMap = dynamic(() => import("./MontrealMap"), {
  ssr: false,
  loading: () => null,
});

export default function MontrealMapClient() {
  return <MontrealMap />;
}
