'use client';

import {
  Activity,
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Globe,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import BlogContentManager from '@/lib/blog-content-manager';
import { BlogPost } from '@/lib/blog-data';

interface AnalyticsData {
  totalPosts: number;
  totalViews: number;
  totalReadingTime: number;
  averageReadingTime: number;
  viewsByMonth: Array<{ month: string; views: number; posts: number }>;
  viewsByCategory: Array<{ category: string; views: number; posts: number }>;
  topPosts: Array<{
    slug: string;
    title: string;
    views: number;
    readingTime: number;
    category: string;
    growth: number;
  }>;
  contentGaps: Array<{
    category: string;
    currentPosts: number;
    recommendedPosts: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  qualityMetrics: {
    averageSEOScore: number;
    postsNeedingImprovement: number;
    postsWithOptimalLength: number;
    postsWithGoodStructure: number;
  };
}

interface ContentAnalyticsProps {
  posts: BlogPost[];
  locale: string;
}

export default function ContentAnalytics({ posts, locale }: ContentAnalyticsProps) {
  const t = useTranslations('blog');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'engagement' | 'quality'>('views');

  // Mock analytics data - in real app, this would come from your analytics service
  useEffect(() => {
    const generateMockAnalytics = (): AnalyticsData => {
      const totalViews = posts.reduce(
        (sum, post) => sum + Math.floor(Math.random() * 1000) + 100,
        0
      );
      const totalReadingTime = posts.reduce((sum, post) => sum + post.readingTime, 0);

      // Generate monthly data
      const viewsByMonth = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        viewsByMonth.push({
          month: month.toLocaleDateString(locale === 'pt-br' ? 'pt-BR' : 'en-US', {
            month: 'short',
            year: 'numeric',
          }),
          views: Math.floor(Math.random() * 5000) + 1000,
          posts: posts.filter((post) => {
            const postDate = new Date(post.date);
            return (
              postDate.getMonth() === month.getMonth() &&
              postDate.getFullYear() === month.getFullYear()
            );
          }).length,
        });
      }

      // Category data
      const categories = [
        'atsOptimization',
        'resumeWriting',
        'interviewPrep',
        'careerAdvice',
        'jobSearch',
        'marketTrends',
      ];
      const viewsByCategory = categories.map((category) => ({
        category: t(`categories.${category}`) || category,
        views: Math.floor(Math.random() * 3000) + 500,
        posts: posts.filter((post) => post.category === category).length,
      }));

      // Top posts
      const topPosts = posts
        .slice(0, 5)
        .map((post) => ({
          slug: post.slug,
          title: post.title,
          views: Math.floor(Math.random() * 2000) + 200,
          readingTime: post.readingTime,
          category: post.category,
          growth: Math.floor(Math.random() * 100) - 20,
        }))
        .sort((a, b) => b.views - a.views);

      // Content gaps
      const contentGaps = categories.map((category) => {
        const currentPosts = posts.filter((post) => post.category === category).length;
        const recommendedPosts = 5; // Target 5 posts per category
        const priority: 'high' | 'medium' | 'low' =
          currentPosts === 0 ? 'high' : currentPosts < 3 ? 'medium' : 'low';

        return {
          category: t(`categories.${category}`) || category,
          currentPosts,
          recommendedPosts,
          priority,
        };
      });

      return {
        totalPosts: posts.length,
        totalViews,
        totalReadingTime,
        averageReadingTime: Math.round(totalReadingTime / posts.length),
        viewsByMonth,
        viewsByCategory,
        topPosts,
        contentGaps,
        qualityMetrics: {
          averageSEOScore: 78,
          postsNeedingImprovement: Math.floor(posts.length * 0.2),
          postsWithOptimalLength: Math.floor(posts.length * 0.7),
          postsWithGoodStructure: Math.floor(posts.length * 0.8),
        },
      };
    };

    setAnalyticsData(generateMockAnalytics());
  }, [posts, locale, t]);

  if (!analyticsData) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('analytics') || 'Análise de Conteúdo'}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('analyticsDescription') || 'Métricas e insights do seu blog'}
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">{t('period') || 'Período'}:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="7d">{t('last7Days') || 'Últimos 7 dias'}</option>
            <option value="30d">{t('last30Days') || 'Últimos 30 dias'}</option>
            <option value="90d">{t('last90Days') || 'Últimos 90 dias'}</option>
            <option value="1y">{t('lastYear') || 'Último ano'}</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('totalPosts') || 'Total de Posts'}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.totalPosts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('totalViews') || 'Visualizações'}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analyticsData.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-green-600">+12%</span>
            <span className="text-gray-500">{t('vsLastPeriod') || 'vs período anterior'}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('avgReadingTime') || 'Tempo Médio de Leitura'}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analyticsData.averageReadingTime} min
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('avgSEOScore') || 'Score SEO Médio'}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analyticsData.qualityMetrics.averageSEOScore}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Views Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('viewsOverTime') || 'Visualizações ao Longo do Tempo'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.viewsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Views by Category */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('viewsByCategory') || 'Visualizações por Categoria'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.viewsByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }: any) => `${category} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="views"
              >
                {analyticsData.viewsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Posts */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('topPosts') || 'Posts Mais Populares'}
        </h3>
        <div className="space-y-4">
          {analyticsData.topPosts.map((post, index) => (
            <div
              key={post.slug}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-indigo-600">{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{post.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>{t(`categories.${post.category}`) || post.category}</span>
                    <span>•</span>
                    <span>{post.readingTime} min leitura</span>
                    <span>•</span>
                    <span>{post.views.toLocaleString()} visualizações</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {post.growth > 0 ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">+{post.growth}%</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-medium">{post.growth}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Gaps and Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Content Gaps */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('contentGaps') || 'Gaps de Conteúdo'}
          </h3>
          <div className="space-y-3">
            {analyticsData.contentGaps
              .filter((gap) => gap.priority === 'high' || gap.priority === 'medium')
              .map((gap, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        gap.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{gap.category}</p>
                      <p className="text-sm text-gray-600">
                        {gap.currentPosts} / {gap.recommendedPosts} posts
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    {gap.recommendedPosts - gap.currentPosts} {t('needed') || 'necessários'}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('qualityMetrics') || 'Métricas de Qualidade'}
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {t('avgSEOScore') || 'Score SEO Médio'}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {analyticsData.qualityMetrics.averageSEOScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${analyticsData.qualityMetrics.averageSEOScore}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {analyticsData.qualityMetrics.postsWithOptimalLength}
                </div>
                <div className="text-sm text-gray-600">
                  {t('optimalLength') || 'Comprimento Ideal'}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {analyticsData.qualityMetrics.postsWithGoodStructure}
                </div>
                <div className="text-sm text-gray-600">{t('goodStructure') || 'Boa Estrutura'}</div>
              </div>
            </div>

            {analyticsData.qualityMetrics.postsNeedingImprovement > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {analyticsData.qualityMetrics.postsNeedingImprovement}{' '}
                    {t('postsNeedImprovement') || 'posts precisam de melhorias'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
