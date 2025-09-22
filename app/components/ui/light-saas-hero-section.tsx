import React from "react";


const HeroSection = () => {
    return (
        <div className="h-[60vh] relative overflow-hidden w-full">
            {/* Neural Network Inspired CSS Background */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                {/* Animated neural network pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-300/30 blur-xl animate-pulse"></div>
                    <div className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full bg-indigo-300/30 blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute bottom-1/4 left-1/3 w-20 h-20 rounded-full bg-purple-300/30 blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
                    <div className="absolute top-1/2 right-1/3 w-28 h-28 rounded-full bg-blue-300/30 blur-xl animate-pulse" style={{animationDelay: '3s'}}></div>
                </div>
                
                {/* Enhanced gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-white/80"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center flex flex-col justify-center h-full">
                {/* Main headline */}
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight pb-4">
                    企業のAI人材を
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block mt-1 pb-2">
                        ゼロから育成する
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                    ChatGPT、Claude等の生成AIを活用した実践的な研修プログラム。未経験者でも短期間で業務に活かせるAIスキルを習得できます。
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button className="group relative overflow-hidden px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-700 transform hover:-translate-y-1 flex items-center">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                        <svg className="w-5 h-5 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <rect width="20" height="16" x="2" y="4" rx="2"/>
                            <path d="m22 7-10 5L2 7"/>
                        </svg>
                        <span className="relative z-10">無料相談予約</span>
                    </button>
                    <button className="group px-8 py-4 bg-white/90 backdrop-blur-sm text-gray-900 font-semibold rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center">
                        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        <span className="group-hover:text-blue-700 transition-colors duration-200">資料ダウンロード</span>
                    </button>
                </div>

            </div>

            {/* Floating elements for visual interest */}
            <div className="absolute top-1/4 left-10 w-6 h-6 rounded-full bg-blue-200/40 blur-xl"></div>
            <div className="absolute bottom-1/3 right-16 w-10 h-10 rounded-full bg-indigo-200/30 blur-xl"></div>
            <div className="absolute top-1/3 right-1/4 w-8 h-8 rounded-full bg-blue-200/40 blur-xl"></div>
        </div>
    );
};

export {HeroSection};