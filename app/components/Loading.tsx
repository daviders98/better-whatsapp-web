import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

function Loading() {
  return (
    <center style={{ display: "grid", placeItems: "center", height: "100vh" }}>
      <div style={{ width: "200px" }}>
        <Image
          loading="eager"
          src="/images/logo.png"
          alt="logo"
          style={{ marginBottom: 8 }}
          height={200}
          width={200}
        />
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    </center>
  );
}

export default Loading;
