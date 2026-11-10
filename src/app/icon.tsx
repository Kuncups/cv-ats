import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFF000",
          border: "3px solid #000000",
          color: "#000000",
          fontWeight: 900,
          fontSize: 20,
          fontFamily: "monospace",
        }}
      >
        D
      </div>
    ),
    {
      ...size,
    }
  );
}
