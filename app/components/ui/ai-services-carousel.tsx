"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface AIServiceCardItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  backgroundImage: string;
  theme: "blue" | "green";
}

// Generic item type for external use (backwards compatible)
export interface GenericServiceItem {
  id: string;
  title: string;
  description: string;
  href: string;
  image?: string;
  backgroundImage?: string;
  category?: string;
  subtitle?: string;
  theme?: "blue" | "green";
  available?: boolean;
}

export interface AIServicesCarouselProps {
  title?: string;
  description?: string;
  showHeader?: boolean;
  showButton?: boolean;
  sectionPadding?: string;
  titleSize?: string;
  items?: GenericServiceItem[];
}

const serviceCards: AIServiceCardItem[] = [
  {
    id: "enterprise-training",
    category: "企業向け AI研修",
    title: "AI Training for Teams",
    subtitle: "組織のAI活用力を底上げする実践型プログラム",
    description: "企業の課題に合わせてカスタマイズした研修で、現場で使えるAIスキルと活用文化を定着させます。",
    href: "/services#enterprise",
    backgroundImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&crop=center",
    theme: "blue",
  },
  {
    id: "individual-coaching",
    category: "個人向け AIコーチング",
    title: "Personal AI Coaching",
    subtitle: "マンツーマンで習得する実践型AIスキル",
    description: "目的やレベルに合わせて専属コーチが伴走し、日常業務で使えるAIスキルを最短で身につけられます。",
    href: "/services/ai-talent-development",
    backgroundImage: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&h=600&fit=crop&crop=center",
    theme: "green",
  },
];

const AIServicesCarousel = ({
  title = "AI人材育成サービス",
  description = "お客様のニーズに合わせてカスタマイズ可能な研修プログラムを提供。基礎から専門的な活用まで、企業・個人それぞれの目標に応じたAI人材育成を実現します。",
  showHeader = true,
  showButton = true,
  sectionPadding = "py-16",
  titleSize = "text-2xl font-bold md:text-3xl tracking-tight",
  items,
}: AIServicesCarouselProps) => {
  // Use provided items or default serviceCards
  const displayCards = items || serviceCards;
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasMounted]);

  // テーマに応じたスタイルを取得
  const getThemeStyles = (theme: "blue" | "green") => {
    if (theme === "blue") {
      return {
        subtitle: "text-blue-600 group-hover:text-blue-300",
        button: "group-hover:bg-blue-500",
      };
    }
    return {
      subtitle: "text-emerald-600 group-hover:text-emerald-300",
      button: "group-hover:bg-emerald-500",
    };
  };

  // アニメーションスタイル
  const getAnimationStyle = (delay: number) => {
    if (!hasMounted) return {};
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
    };
  };

  return (
    <section ref={sectionRef} className={sectionPadding}>
      {/* 左右分割レイアウト: 4:6 */}
      <div className="flex flex-col lg:flex-row lg:gap-12">
        {/* 左側: テキスト群 (4/10) */}
        {showHeader && (
          <div className="lg:w-[40%] mb-10 lg:mb-0">
            {/* セクションラベル（Eyebrow） */}
            <div className="mb-2" style={getAnimationStyle(0)}>
              <span className="text-2xl font-medium text-blue-600 tracking-tight">Service</span>
            </div>
            
            <h2 className={`${titleSize} mb-6`} style={getAnimationStyle(0.1)}>
              {title}
            </h2>
            <div className="space-y-4 mb-12" style={getAnimationStyle(0.2)}>
              <p className="text-base text-gray-600 leading-relaxed">
                お客様のニーズに合わせてカスタマイズ可能な研修プログラムを提供。
              </p>
              <p className="text-base text-gray-600 leading-relaxed">
                基礎から専門的な活用まで、企業・個人それぞれの目標に応じたAI人材育成を実現します。
              </p>
            </div>
            
            {/* 詳しく見るボタン */}
            {showButton && (
              <div style={getAnimationStyle(0.3)}>
                <a
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 border border-blue-600 font-light hover:bg-blue-50 transition-colors duration-200 text-base"
                >
                  すべての研修を見る
                  <ArrowRight className="size-4" />
                </a>
              </div>
            )}
          </div>
        )}
        
        {/* 右側: カード群 (6/10) - 上下に並べる */}
        <div className={`${showHeader ? 'lg:w-[60%]' : 'w-full'} flex flex-col gap-6`}>
          {displayCards.map((card, index) => {
            const cardTheme = card.theme || (card.category === "individual" ? "green" : "blue");
            const themeStyles = getThemeStyles(cardTheme);
            const cardImage = card.backgroundImage || card.image || "";
            const cardSubtitle = card.subtitle || "";
            const cardCategory = card.category || "";

            return (
              <div
                key={card.id}
                style={getAnimationStyle(0.2 + index * 0.15)}
              >
                <Link
                  href={card.href}
                  className="group relative block"
                >
                  {/* カード本体 */}
                  <div className="relative bg-white rounded-3xl border border-gray-200 overflow-hidden transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:border-transparent min-h-[240px]">
                  {/* 背景画像（ホバー時に表示） */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {cardImage && (
                      <Image
                        src={cardImage}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 60vw"
                      />
                    )}
                    {/* オーバーレイ - 全体に薄くかける */}
                    <div className="absolute inset-0 bg-slate-700/70" />
                    {/* グラデーションマスク - 左から右へ透明に（左40%は完全マスク） */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to right, rgb(51 65 85) 0%, rgb(51 65 85) 40%, transparent 100%)'
                      }}
                    />
                  </div>
                    
                    {/* コンテンツ - 左右分割 7:3 */}
                    <div className="relative z-10 p-8 h-full flex">
                      {/* 左側: テキスト群 (70%) */}
                      <div className="w-[70%] flex flex-col">
                        {/* カテゴリラベル */}
                        {cardCategory && (
                          <p className="text-sm font-medium text-gray-500 group-hover:text-gray-300 transition-colors duration-500 mb-3">
                            {cardCategory}
                          </p>
                        )}
                        
                        {/* タイトル */}
                        <div className="mb-4">
                          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 group-hover:text-white transition-colors duration-500">
                            {card.title}
                          </h3>
                          {cardSubtitle && (
                            <p className={`text-sm font-medium transition-colors duration-500 mt-1 ${themeStyles.subtitle}`}>
                              {cardSubtitle}
                            </p>
                          )}
                        </div>
                        
                        {/* 説明文 */}
                        <p className="text-sm text-gray-600 group-hover:text-gray-200 transition-colors duration-500 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                      
                      {/* 右側: 画像エリア (30%) - 後でホバー時のオブジェクト画像を配置 */}
                      <div className="w-[30%] flex items-center justify-center">
                        {/* 画像用スペース - 後ほど実装 */}
                      </div>
                    </div>
                    
                    {/* 矢印ボタン - カード右下に配置、ホバー時に拡大 */}
                    <div className="absolute bottom-6 right-6 z-10">
                      <div className={`w-10 h-10 group-hover:w-14 group-hover:h-14 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-500 ${themeStyles.button}`}>
                        <ArrowRight className="w-4 h-4 group-hover:w-6 group-hover:h-6 text-gray-400 group-hover:text-white transition-all duration-500" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { AIServicesCarousel };
