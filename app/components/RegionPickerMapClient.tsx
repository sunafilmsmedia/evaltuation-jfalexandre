"use client";

import dynamic from "next/dynamic";

const RegionPickerMap = dynamic(() => import("./RegionPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-red-100 h-[360px] md:h-[400px] bg-red-50/40 animate-pulse" />
  ),
});

type Props = {
  value: string | undefined;
  onChange: (v: string) => void;
};

export default function RegionPickerMapClient(props: Props) {
  return <RegionPickerMap {...props} />;
}
