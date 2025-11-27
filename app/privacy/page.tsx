import MainLayout from '@/app/components/MainLayout'
import PageHeader from '@/app/components/ui/PageHeader'

export default function PrivacyPage() {
  return (
    <MainLayout hideRightSidebar={true}>
      <div className="w-full max-w-4xl mx-auto">
        <PageHeader title="PRIVACY POLICY" subtitle="プライバシーポリシー" />
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            当サイト運営者（以下「当社」といいます。）は、本サイト上で提供するサービス（以下「本サービス」といいます。）における、利用者の個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. 個人情報の定義</h2>
          <p className="text-gray-600 mb-6">
            「個人情報」とは、個人情報保護法に定める「個人情報」を指し、生存する個人に関する情報であって、氏名、生年月日、住所、電話番号、メールアドレス等により特定の個人を識別できる情報、ならびに容貌、指紋、声紋、保険者番号等の個人識別情報を含みます。
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. 個人情報の収集方法</h2>
          <p className="text-gray-600 mb-2">
            当社は、利用者がサービス利用登録やお問い合わせを行う際に、氏名、住所、電話番号、メールアドレス等の個人情報を収集することがあります。
          </p>
          <p className="text-gray-600 mb-6">
            また、提携先等を通じて取引記録や決済情報を取得する場合があります。
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. 個人情報の利用目的</h2>
          <p className="text-gray-600 mb-2">
            当社が個人情報を収集・利用する目的は以下のとおりです。
          </p>
          <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
            <li>本サービスの提供・運営のため</li>
            <li>お問い合わせへの対応（本人確認を含む）</li>
            <li>新機能・更新情報・イベント等の案内送付のため</li>
            <li>メンテナンスや重要なお知らせ等の連絡のため</li>
            <li>不正利用防止や利用規約違反への対応のため</li>
            <li>登録情報の閲覧・変更・削除等を利用者が行うため</li>
            <li>有料サービスにおける利用料金の請求のため</li>
            <li>上記に付随する目的</li>
          </ol>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. 利用目的の変更</h2>
          <p className="text-gray-600 mb-6">
            当社は、利用目的が変更前と合理的な関連性を有すると認められる場合に限り、利用目的を変更することがあります。変更があった場合は、当社所定の方法により通知または本サイト上で公表します。
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. 個人情報の第三者提供</h2>
          <p className="text-gray-600 mb-2">
            当社は、次の場合を除き、利用者の同意なく個人情報を第三者に提供しません。
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2 ml-4">
            <li>法令に基づく場合</li>
            <li>人の生命・身体・財産の保護が必要な場合</li>
            <li>公衆衛生の向上や児童の健全育成の推進が必要な場合</li>
            <li>国の機関や地方公共団体が法令に基づき協力を求める場合</li>
            <li>あらかじめ公表し、個人情報保護委員会に届出を行った場合</li>
          </ul>
          <p className="text-gray-600 mb-2">
            なお、次の場合は第三者提供に該当しません。
          </p>
          <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
            <li>利用目的の達成に必要な範囲で委託する場合</li>
            <li>事業承継に伴って個人情報が提供される場合</li>
            <li>特定の者との共同利用について、利用者に通知または公表した場合</li>
          </ol>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. 個人情報の開示</h2>
          <p className="text-gray-600 mb-2">
            利用者から個人情報の開示を求められた場合、当社は遅滞なくこれを開示します。ただし、以下の場合は一部または全部を開示しないことがあります。
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2 ml-4">
            <li>本人または第三者の権利利益を害するおそれがある場合</li>
            <li>当社の業務遂行に著しい支障を及ぼす場合</li>
            <li>法令に違反する場合</li>
          </ul>
          <p className="text-gray-600 mb-6">
            開示請求にあたり、1件につき1,000円の手数料を申し受けます。
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. 個人情報の訂正・削除</h2>
          <p className="text-gray-600 mb-6">
            利用者は、当社が保有する自己の個人情報が誤っている場合、訂正・追加・削除を請求できます。当社は必要と判断した場合、遅滞なく訂正等を行い、結果を利用者に通知します。
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. 個人情報の利用停止・消去</h2>
          <p className="text-gray-600 mb-6">
            利用者から、個人情報が不正に取得された、または利用目的を超えて利用されているとの理由で利用停止や消去を求められた場合、当社は調査のうえ必要に応じて対応します。対応が困難な場合は、代替措置を講じます。
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. プライバシーポリシーの変更</h2>
          <p className="text-gray-600 mb-6">
            当社は、法令に別段の定めがある場合を除き、本ポリシーを予告なく変更できるものとします。変更後の内容は、本サイトに掲載した時点で効力を生じます。
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. お問い合わせ窓口</h2>
          <p className="text-gray-600 mb-4">
            本ポリシーに関するお問い合わせは、以下の窓口までお願いいたします。
          </p>
          <div className="bg-gray-50 p-6 rounded-lg text-gray-600">
            <p className="mb-2">社名：LandBridge株式会社</p>
            <p>Eメールアドレス：info@landbridge.co.jp</p>
          </div>

          <p className="text-right text-gray-600 mt-12 font-semibold">
            制定日：2025年8月1日
          </p>
        </div>
      </div>
    </MainLayout>
  )
}