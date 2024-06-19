import React from "react";
import Image from "next/image";

type Props = {};

function Loading({}: Props) {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-700"></div>
    </div>
  );
}

export default Loading;
