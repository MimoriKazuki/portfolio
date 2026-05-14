import Link from 'next/link'
import { Button } from '@/app/components/atoms/Button'
import { LPTemplate } from '@/app/components/templates/LPTemplate'
import { HeroSection } from '@/app/components/organisms/landing/HeroSection'
import { ValuePropsSection } from '@/app/components/organisms/landing/ValuePropsSection'
import { CourseShowcase } from '@/app/components/organisms/landing/CourseShowcase'
import { ContentShowcase } from '@/app/components/organisms/landing/ContentShowcase'
import { TestimonialSection } from '@/app/components/organisms/landing/TestimonialSection'
import { StatsSection } from '@/app/components/organisms/landing/StatsSection'
import { FAQAccordion } from '@/app/components/organisms/landing/FAQAccordion'
import { ContactSection } from '@/app/components/organisms/landing/ContactSection'
import { dummyValueProps } from './_lib/dummy-value-props'
import { dummyTestimonials } from './_lib/dummy-testimonials'
import { dummyStats } from './_lib/dummy-stats'
import { dummyFAQs } from './_lib/dummy-faq'
import {
  getFeaturedContents,
  getFeaturedCourses,
  type LPFeaturedContent,
  type LPFeaturedCourse,
} from './_lib/get-lp-data'

/**
 * B001 新 LP ページ（Server Component / SSR・キャッシュなし）
 *
 * 起点：
 * - docs/frontend/screens.md B001
 * - docs/frontend/page-templates.md §LPTemplate
 *
 * 配置方針：
 * - 既存 /e-learning ページ（旧 LP）は完全非破壊。新 LP は別 path /e-learning/lp に独立
 * - 旧 LP は P3-CLEANUP-01 タイミングで削除予定（Kosuke 判断 2026-05-14）
 *
 * 仮素材（差し替え前提）：
 * - ヒーローコピー / 価値訴求 / 受講生の声 / 実績数値 / FAQ は _lib/dummy-*.ts に分離
 * - 注目コース / 注目単体動画は DB から is_featured=true & is_published=true を取得
 *
 * NG ルール遵守：
 * - 既存 ui/ / 既存 LP / 既存 Header / MobileHeader / Sidebar / Footer は touch しない
 * - has_full_access / 個人別情報を LP に含めない（誰でも見られる集計のみ）
 */

export const dynamic = 'force-dynamic'

function FeaturedCourseCard({ course }: { course: LPFeaturedCourse }) {
  return (
    <Link
      href={`/e-learning/courses/${course.slug}`}
      className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-5 text-card-foreground transition hover:border-primary"
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{course.is_free ? '無料体験' : 'コース'}</span>
        {!course.is_free && course.price !== null && (
          <span className="text-foreground">¥{course.price.toLocaleString()}</span>
        )}
      </div>
      <h3 className="text-lg text-foreground group-hover:text-primary">{course.title}</h3>
      {course.description && (
        <p className="line-clamp-3 text-sm text-muted-foreground">{course.description}</p>
      )}
    </Link>
  )
}

function FeaturedContentCard({ content }: { content: LPFeaturedContent }) {
  return (
    <Link
      href={`/e-learning/${content.id}`}
      className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-5 text-card-foreground transition hover:border-primary"
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{content.is_free ? '無料' : '単体動画'}</span>
        {content.duration && <span>{content.duration}</span>}
      </div>
      <h3 className="text-base text-foreground group-hover:text-primary">{content.title}</h3>
      {content.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{content.description}</p>
      )}
    </Link>
  )
}

export default async function ELearningLPPage() {
  const [featuredCourses, featuredContents] = await Promise.all([
    getFeaturedCourses(3),
    getFeaturedContents(4),
  ])

  return (
    <LPTemplate
      hero={
        <HeroSection
          title="AI を「使える」レベルへ、最短距離で。"
          description="生成 AI を実務で使いこなすためのコースと単体動画を提供しています。無料体験から始められます。"
          cta={
            <>
              <Button asChild size="lg">
                <Link href="/e-learning/lp/courses">コースを探す</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">無料で始める</Link>
              </Button>
            </>
          }
        />
      }
      valueProps={
        <ValuePropsSection
          title="AI 駆動研究所の Eラーニングが選ばれる理由"
          description="単なる知識習得ではなく、業務で使える状態をゴールに設計しています。"
          items={dummyValueProps}
        />
      }
      courseShowcase={
        featuredCourses.length > 0 ? (
          <CourseShowcase
            title="注目のコース"
            description="体系的に学べるコース。順番に視聴して理解を深められます。"
            cta={
              <Button asChild variant="outline">
                <Link href="/e-learning/lp/courses">すべて見る</Link>
              </Button>
            }
          >
            {featuredCourses.map(course => (
              <FeaturedCourseCard key={course.id} course={course} />
            ))}
          </CourseShowcase>
        ) : null
      }
      contentShowcase={
        featuredContents.length > 0 ? (
          <ContentShowcase
            title="ピックアップ動画"
            description="気になるテーマだけサクッと視聴できる単体動画。"
            cta={
              <Button asChild variant="outline">
                <Link href="/e-learning/lp/videos">すべて見る</Link>
              </Button>
            }
          >
            {featuredContents.map(content => (
              <FeaturedContentCard key={content.id} content={content} />
            ))}
          </ContentShowcase>
        ) : null
      }
      testimonials={
        <TestimonialSection
          title="受講生の声"
          description="実際にご受講いただいた方からのフィードバックの一部をご紹介します。"
          testimonials={dummyTestimonials}
        />
      }
      stats={
        <StatsSection
          title="数字で見る AI 駆動研究所"
          stats={dummyStats}
        />
      }
      faq={
        <FAQAccordion
          title="よくあるご質問"
          items={dummyFAQs}
        />
      }
      contact={
        <ContactSection
          title="法人向け / カスタム研修もご相談ください"
          description="社内研修としての導入や、業種別のカスタムコース制作も承ります。"
          ctaLabel="お問い合わせ"
          ctaHref="/contact"
        />
      }
    />
  )
}
