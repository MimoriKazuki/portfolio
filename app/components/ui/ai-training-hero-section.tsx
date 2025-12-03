import React from "react";
import Image from "next/image";

const AITrainingHeroSection = () => {
  return (
    <div className="h-[360px] relative overflow-hidden w-full">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop&crop=center"
        alt="生成AI総合研修"
        fill
        className="object-cover object-center"
        priority
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Title */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1 className="text-4xl md:text-5xl text-white tracking-tight">
          生成AI総合研修
        </h1>
      </div>
    </div>
  );
};

export { AITrainingHeroSection };