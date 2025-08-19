import MainLayout from '@/app/components/MainLayout'

export default function TermsPage() {
  return (
    <MainLayout hideRightSidebar={true}>
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            本利用規約（以下「本規約」といいます。）は、本サイトの閲覧・利用に関する条件を定めるものです。本サイトを利用される方（以下「利用者」といいます。）は、本規約の内容をご確認いただき、同意のうえご利用ください。
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. 著作権・知的財産権について</h2>
          <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
            <li>本サイトに掲載されている文書、写真、イラスト、画像、動画、プログラム、ソースコード、実績紹介等の著作物に関する著作権その他の知的財産権は、当サイト運営者または正当な権利を有する第三者に帰属します。</li>
            <li>著作権法で認められた私的利用の範囲を超えて、当サイト運営者の事前の許可なく、無断で転載、複製、改変、公衆送信、翻訳、販売、貸与、再利用等を行うことはできません。</li>
            <li>本サイトに掲載している開発実績は、顧客企業の承諾を得た範囲で公開しているものであり、無断利用や第三者への転用を固く禁じます。</li>
          </ol>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. 商標について</h2>
          <p className="text-gray-600 mb-6">
            本サイト上に表示される会社名、サービス名、製品名等は、各社の商標または登録商標です。利用者は、当サイトの利用を通じて、明示的に許諾された場合を除き、これらの権利を使用することはできません。
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. 免責事項</h2>
          <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
            <li>当サイトに掲載される情報は、正確性や最新性の確保に努めておりますが、その内容について保証するものではありません。</li>
            <li>当サイトの利用により発生した利用者または第三者の損害について、当サイト運営者は一切の責任を負いません。</li>
            <li>本サイトに掲載された開発実績は、特定の効果や成果を保証するものではなく、利用者の環境・条件によって結果が異なる場合があります。</li>
          </ol>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. 推奨環境</h2>
          <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
            <li>本サイトは、スマートフォン・タブレット・PC等、各種端末に応じて最適化したレスポンシブデザインを採用しています。</li>
            <li>ご利用にあたっては、最新バージョンのウェブブラウザを推奨します。環境設定や端末の仕様によっては、正しく表示されない場合があります。</li>
          </ol>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. 禁止事項</h2>
          <p className="text-gray-600 mb-2">
            利用者は、本サイトの利用にあたり、以下の行為をしてはなりません。
          </p>
          <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
            <li>当サイトまたは第三者の権利・利益を侵害する行為</li>
            <li>当サイトの運営を妨害する行為</li>
            <li>虚偽の情報を送信または登録する行為</li>
            <li>公序良俗に反する行為、または法令に違反する行為</li>
          </ol>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. 規約の変更</h2>
          <p className="text-gray-600 mb-6">
            当サイト運営者は、必要に応じて本規約を予告なく変更することがあります。変更後の規約は、本サイトに掲載された時点から効力を生じるものとします。
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. 準拠法・裁判管轄</h2>
          <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
            <li>本規約の解釈および適用は、日本法に準拠します。</li>
            <li>本サイトに関して利用者と運営者の間で紛争が生じた場合、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。</li>
          </ol>

          <p className="text-right text-gray-600 mt-12 font-semibold">
            最終更新日：2025年8月19日
          </p>
        </div>
      </div>
    </MainLayout>
  )
}