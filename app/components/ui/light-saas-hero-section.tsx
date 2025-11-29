'use client'

import React, { useEffect, useState } from "react";
import Image from "next/image";

const HeroSection = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // マウント後にアニメーションを開始
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative overflow-hidden w-full bg-white">
            {/* Content Container - Fluid Design */}
            <div className="w-full py-16">

                {/* Text Content with responsive padding */}
                <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mb-8 relative">
                    <div className="w-full lg:w-4/5 xl:w-3/4 2xl:w-[70%]">
                        {/* タイトル - 左からフェードイン */}
                        <h1 
                            className="font-bold text-gray-900 tracking-tight leading-none mb-6"
                            style={{
                                fontSize: 'clamp(2rem, 5vw, 5rem)',
                                lineHeight: '1.1',
                                opacity: isLoaded ? 1 : 0,
                                transform: isLoaded ? 'translateX(0)' : 'translateX(-30px)',
                                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                        >
                            Advance Your<br />
                            Business with AI
                        </h1>

                        {/* Sub Phrase - 左からフェードイン（遅延あり） */}
                        <p 
                            className="text-gray-600 leading-relaxed"
                            style={{
                                fontSize: 'clamp(1rem, 1.5vw, 1.5rem)',
                                opacity: isLoaded ? 1 : 0,
                                transform: isLoaded ? 'translateX(0)' : 'translateX(-30px)',
                                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
                            }}
                        >
                            実践的なAIの力を、一人でも多くの現場へ届ける。
                        </p>
                    </div>

                    {/* Scroll Down Indicator - Bottom Right */}
                    <div
                        className="absolute bottom-0 right-4 sm:right-6 lg:right-8 xl:right-12 2xl:right-16 hidden xs:flex flex-col items-center"
                        style={{
                            opacity: isLoaded ? 1 : 0,
                            transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s',
                        }}
                    >
                        <span className="text-sm text-gray-500 mb-2 tracking-wider">SCROLL DOWN</span>
                        <svg className="w-6 h-6 text-gray-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                        </svg>
                    </div>
                </div>

                {/* Hero Image - Full width to right edge, left padding only */}
                <div 
                    className="relative w-full mb-12 overflow-hidden pl-4 sm:pl-6 lg:pl-8 xl:pl-12 2xl:pl-16"
                    style={{
                        opacity: isLoaded ? 1 : 0,
                        transform: isLoaded ? 'scale(1)' : 'scale(1.02)',
                        transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
                    }}
                >
                    <div className="relative w-full aspect-[21/9]">
                        <Image 
                            src="/hero.png"
                            alt="AI人材育成の未来を表現する画像"
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* CTA Buttons - 下からフェードイン */}
                <div 
                    className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex flex-col sm:flex-row gap-6 justify-center items-center"
                    style={{
                        opacity: isLoaded ? 1 : 0,
                        transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
                    }}
                >
                    <a
                        href="/documents"
                        className="px-10 py-4 bg-white text-gray-900 font-light border border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        資料をダウンロード
                    </a>
                    <a
                        href="/contact"
                        className="px-10 py-4 bg-blue-600 text-white font-light hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <rect width="20" height="16" x="2" y="4" rx="2"/>
                            <path d="m22 7-10 5L2 7"/>
                        </svg>
                        無料相談を予約する
                    </a>
                </div>
            </div>
        </div>
    );
};

export {HeroSection};
