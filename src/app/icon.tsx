import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: "#F5F0EA",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#A0522D",
          fontWeight: 700,
          fontFamily: "Georgia, serif",
        }}
      >
        R
      </div>
    ),
    { ...size }
  );
}
