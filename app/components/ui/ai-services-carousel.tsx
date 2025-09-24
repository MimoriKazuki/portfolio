"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
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
  const [windowWidth, setWindowWidth] = useState(1200); // PCサイズで初期化
  const [currentPage, setCurrentPage] = useState(0); // ページ番号を直接管理
  
  // 表示枚数とページ数を計算
  const getDisplayConfig = useCallback(() => {
    let cardsPerView = 3; // デフォルトは3枚表示
    
    if (windowWidth >= 1025) cardsPerView = 3;      // PC: 3枚
    else if (windowWidth >= 900) cardsPerView = 3;  // 900-1024px: 3枚
    else if (windowWidth >= 641) cardsPerView = 2;  // 641-899px: 2枚
    else if (windowWidth >= 540) cardsPerView = 2;  // 540-640px: 2枚
    else cardsPerView = 1; // 539px以下: 1枚
    
    const totalPages = Math.ceil(items.length / cardsPerView);
    
    return { cardsPerView, totalPages };
  }, [windowWidth, items.length]);

  // シンプルな固定設定でEmblaCarouselを初期化
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    containScroll: 'keepSnaps',
    skipSnaps: false,
  });
  
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // ウィンドウサイズ監視とカルーセル再初期化
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setWindowWidth(window.innerWidth);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateSelection = useCallback(() => {
    if (!emblaApi) return;
    
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    
    // カーソルスクロール時のページ検出
    const currentSnapIndex = emblaApi.selectedScrollSnap();
    const { cardsPerView } = getDisplayConfig();
    
    // 現在の表示カードからページを計算
    let detectedPage = 0;
    
    if (cardsPerView === 3) {
      // 3枚表示: インデックス0-2=ページ0、インデックス3-5=ページ1
      detectedPage = currentSnapIndex >= 3 ? 1 : 0;
    } else if (cardsPerView === 2) {
      // 2枚表示: インデックス0-1=ページ0、2-3=ページ1、4-5=ページ2
      if (currentSnapIndex >= 4) detectedPage = 2;
      else if (currentSnapIndex >= 2) detectedPage = 1;
      else detectedPage = 0;
    } else {
      // 1枚表示
      detectedPage = currentSnapIndex;
    }
    
    // currentPageと異なる場合のみ更新（カーソル操作検出）
    if (detectedPage !== currentPage) {
      console.log(`🖱️ Cursor scroll detected: Page ${currentPage} → ${detectedPage}`);
      setCurrentPage(detectedPage);
    }
    
    console.log(`📍 Current state: Snap ${currentSnapIndex}, Page ${currentPage} (${cardsPerView} cards)`);
  }, [emblaApi, getDisplayConfig, currentPage]);

  // ウィンドウサイズ変更時にページをリセット
  useEffect(() => {
    setCurrentPage(0);
    if (emblaApi) {
      emblaApi.scrollTo(0);
      console.log(`📱 Screen size changed to ${windowWidth}px`);
    }
  }, [windowWidth, emblaApi]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi || currentPage === 0) return;
    
    const { cardsPerView } = getDisplayConfig();
    const newPage = currentPage - 1;
    
    // 正確なターゲットインデックスを計算
    let targetIndex = 0;
    if (cardsPerView === 3) {
      targetIndex = newPage * 3;
    } else if (cardsPerView === 2) {
      targetIndex = newPage * 2;
    } else {
      targetIndex = newPage;
    }
    
    console.log(`ARROW PREV: Page ${currentPage} → Page ${newPage} (Index ${targetIndex})`);
    emblaApi.scrollTo(targetIndex);
    setCurrentPage(newPage);
  }, [emblaApi, currentPage, getDisplayConfig]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    
    const { cardsPerView, totalPages } = getDisplayConfig();
    if (currentPage >= totalPages - 1) return;
    
    const newPage = currentPage + 1;
    
    // 正確なターゲットインデックスを計算
    let targetIndex = 0;
    if (cardsPerView === 3) {
      // 3枚表示: ページ0→インデックス0、ページ1→インデックス3
      targetIndex = newPage * 3;
    } else if (cardsPerView === 2) {
      // 2枚表示: ページ0→インデックス0、ページ1→インデックス2、ページ2→インデックス4
      targetIndex = newPage * 2;
    } else {
      // 1枚表示
      targetIndex = newPage;
    }
    
    console.log(`ARROW NEXT: Page ${currentPage} → Page ${newPage} (Index ${targetIndex})`);
    emblaApi.scrollTo(targetIndex);
    setCurrentPage(newPage);
  }, [emblaApi, currentPage, getDisplayConfig]);

  const scrollTo = useCallback((pageIndex: number) => {
    if (!emblaApi) return;
    
    const { cardsPerView } = getDisplayConfig();
    
    // 正確なターゲットインデックスを計算
    let targetIndex = 0;
    if (cardsPerView === 3) {
      targetIndex = pageIndex * 3;
    } else if (cardsPerView === 2) {
      targetIndex = pageIndex * 2;
    } else {
      targetIndex = pageIndex;
    }
    
    console.log(`DOT CLICK: Page ${pageIndex} (Index ${targetIndex})`);
    emblaApi.scrollTo(targetIndex);
    setCurrentPage(pageIndex);
  }, [emblaApi, getDisplayConfig]);

  useEffect(() => {
    if (!emblaApi) return;
    
    // 少し遅延してイベントリスナーを登録（初期化完了後）
    const timer = setTimeout(() => {
      updateSelection();
      
      emblaApi.on('select', updateSelection);
      emblaApi.on('reInit', updateSelection);
      
      console.log('📡 Event listeners attached');
    }, 100);
    
    return () => {
      clearTimeout(timer);
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
                className="flex-shrink-0 w-full xs:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/3 px-3"
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
          {/* Dots centered - 全ての範囲で表示 */}
          <div className="flex justify-center gap-4">
            {Array.from({ length: getDisplayConfig().totalPages }).map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  currentPage === index ? "bg-blue-600" : "bg-blue-600/20"
                }`}
                onClick={() => scrollTo(index)}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Navigation arrows - 全ての範囲で表示 */}
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