import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 118,
          background: "#F5F0EA",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#A0522D",
          fontWeight: 700,
          fontFamily: "Georgia, serif",
          borderRadius: 40,
        }}
      >
        R
      </div>
    ),
    { ...size }
  );
}
