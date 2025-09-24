"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from 'embla-carousel-react';

export interface AIServiceItem {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
  available: boolean;
  category: "enterprise" | "individual";
}

export interface AIServicesCarouselProps {
  title?: string;
  description?: string;
  items?: AIServiceItem[];
  showHeader?: boolean;
  showButton?: boolean;
  sectionPadding?: string;
  titleSize?: string;
}

const defaultData: AIServiceItem[] = [
  {
    id: "comprehensive-ai-training",
    title: "生成AI総合研修",
    description:
      "生成AIの基礎から実践まで、企業の現場で即戦力として活躍できる人材を育成する包括的な研修プログラムです。",
    href: "/services/comprehensive-ai-training",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&crop=center",
    available: true,
    category: "enterprise"
  },
  {
    id: "ai-writing",
    title: "AIライティング研修",
    description:
      "ChatGPTやClaude等を活用した効果的な文章作成技術を習得し、業務文書の品質向上と作業効率化を実現します。",
    href: "/services/ai-writing-training",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop&crop=center",
    available: true,
    category: "enterprise"
  },
  {
    id: "ai-video",
    title: "AI動画生成研修",
    description:
      "最新のAI動画生成ツールを活用して、マーケティング動画やプレゼンテーション動画を効率的に制作する技術を学びます。",
    href: "/services/ai-video-training",
    image:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop&crop=center",
    available: true,
    category: "enterprise"
  },
  {
    id: "ai-coding",
    title: "AIコーディング研修",
    description:
      "GitHub Copilot、Claude Code等を活用したAI支援プログラミング技術を習得し、開発効率を飛躍的に向上させます。",
    href: "/services/ai-coding-training",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop&crop=center",
    available: true,
    category: "enterprise"
  },
  {
    id: "practical-ai",
    title: "生成AI実務活用研修",
    description:
      "日常業務における生成AIの具体的な活用シーンを学び、業務プロセス全体の効率化と品質向上を実現します。",
    href: "/services/practical-ai-training",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop&crop=center",
    available: true,
    category: "enterprise"
  },
  {
    id: "individual-coaching",
    title: "AI人材育成所",
    description:
      "個人向けAIスキル向上プログラム。自分のペースでAIを学び、キャリアアップを目指せます。",
    href: "/services/ai-talent-development",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center",
    available: true,
    category: "individual"
  },
];

const AIServicesCarousel = ({
  title = "AI人材育成サービス",
  description = "お客様のニーズに合わせてカスタマイズ可能な研修プログラムを提供。基礎から専門的な活用まで、企業・個人それぞれの目標に応じたAI人材育成を実現します。",
  items = defaultData,
  showHeader = true,
  showButton = true,
  sectionPadding = "py-16",
  titleSize = "text-2xl font-bold md:text-3xl",
}: AIServicesCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: false,
    containScroll: 'trimSnaps',
    slidesToScroll: 3, // 一度に3枚移動
  });
  
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const updateSelection = useCallback(() => {
    if (!emblaApi) return;
    
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setCurrentSlide(Math.floor(emblaApi.selectedScrollSnap() / 3));
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (!emblaApi) return;
    emblaApi.scrollTo(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    updateSelection();
    
    emblaApi.on('select', updateSelection);
    emblaApi.on('reInit', updateSelection);
    
    return () => {
      emblaApi.off('select', updateSelection);
      emblaApi.off('reInit', updateSelection);
    };
  }, [emblaApi, updateSelection]);

  return (
    <section className={sectionPadding}>
      {showHeader && (
        <div className="text-center mb-12">
          <h2 className={`${titleSize} mb-6`}>
            {title}
          </h2>
          <p className="max-w-2xl mx-auto text-base text-gray-600 mb-8 leading-relaxed">{description}</p>
          
          {/* 詳しく見るボタン */}
          {showButton && (
            <div className="flex justify-center">
              <a
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-base"
              >
                すべての研修を見る
                <ArrowRight className="size-4" />
              </a>
            </div>
          )}
        </div>
      )}
      <div className="w-full">        
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-3"
              >
                {item.available ? (
                  <Link href={item.href} className="group rounded-xl">
                    <div className="group relative h-full min-h-[20rem] w-full overflow-hidden rounded-xl aspect-[4/5]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="absolute h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        priority={index < 3}
                        loading={index < 3 ? "eager" : "lazy"}
                      />
                      <div className="absolute inset-0 h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-6 text-white">
                        <div className="mb-3 pt-4 text-xl font-semibold">
                          {item.title}
                        </div>
                        <div className="mb-6 line-clamp-2 text-base leading-relaxed">
                          {item.description}
                        </div>
                        <div className="flex items-center text-base font-medium">
                          詳しく見る{" "}
                          <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="group rounded-xl cursor-not-allowed">
                    <div className="group relative h-full min-h-[20rem] w-full overflow-hidden rounded-xl aspect-[4/5] opacity-75">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="absolute h-full w-full object-cover object-center"
                      />
                      <div className="absolute inset-0 h-full bg-gradient-to-t from-gray-900/80 via-gray-600/40 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-6 text-white">
                        <div className="mb-3 pt-4 text-xl font-semibold">
                          {item.title}
                        </div>
                        <div className="mb-6 line-clamp-2 text-base leading-relaxed">
                          {item.description}
                        </div>
                        <div className="flex items-center text-sm opacity-75">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-200/20 text-gray-200 rounded-full">
                            Coming Soon
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        
        {/* Container for dots and arrows with proper positioning */}
        <div className="mt-12 relative">
          {/* Dots centered */}
          <div className="flex justify-center gap-4">
            {Array.from({ length: Math.ceil(items.length / 3) }).map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  currentSlide === index ? "bg-blue-600" : "bg-blue-600/20"
                }`}
                onClick={() => scrollTo(index * 3)}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Navigation arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 right-0 flex gap-5">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="p-3 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="size-5 text-gray-600" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="p-3 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="size-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { AIServicesCarousel };