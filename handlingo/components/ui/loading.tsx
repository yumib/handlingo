// handligo component for loading page

"use client";
import Image from "next/image";
import React from 'react'

const LoadingImage = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <Image
        src="/assets/loading-pimp.png"
        alt="Loading..."
        width={200}
        height={200}
      />
    </div>
  );
};

export default LoadingImage;
