import React, { useState, useMemo } from 'react';
import { useITSM } from '@/context/ITSMContext';
import {
  Search,
  BookOpen,
  Eye,
  ThumbsUp,
  Clock,
  User,
  ArrowLeft,
  Tag,
  ChevronRight,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { KnowledgeArticle } from '@/data/mockData';

export default function KnowledgeBase() {
  const { articles, getUserById } = useITSM();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(articles.map(a => a.category))].sort();
  }, [articles]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      if (search) {
        const searchLower = search.toLowerCase();
        if (
          !article.title.toLowerCase().includes(searchLower) &&
          !article.content.toLowerCase().includes(searchLower) &&
          !article.tags.some(t => t.toLowerCase().includes(searchLower))
        ) {
          return false;
        }
      }
      if (selectedCategory && article.category !== selectedCategory) return false;
      return true;
    });
  }, [articles, search, selectedCategory]);

  // Popular articles
  const popularArticles = useMemo(() => {
    return [...articles].sort((a, b) => b.views - a.views).slice(0, 5);
  }, [articles]);

  // Articles by category
  const articlesByCategory = useMemo(() => {
    const grouped: Record<string, KnowledgeArticle[]> = {};
    articles.forEach(article => {
      if (!grouped[article.category]) {
        grouped[article.category] = [];
      }
      grouped[article.category].push(article);
    });
    return grouped;
  }, [articles]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Render article content (simple markdown-like rendering)
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-gray-900 mt-6 mb-4">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold text-gray-900 mt-5 mb-3">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold text-gray-900 mt-4 mb-2">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="text-gray-700 ml-4">{line.slice(2)}</li>;
      }
      if (line.startsWith('```')) {
        return null;
      }
      if (line.match(/^\d+\./)) {
        return <li key={index} className="text-gray-700 ml-4 list-decimal">{line.replace(/^\d+\./, '').trim()}</li>;
      }
      if (line.startsWith('|')) {
        return null; // Skip table rows for simplicity
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold text-gray-900 my-2">{line.slice(2, -2)}</p>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="text-gray-700 my-2">{line}</p>;
    });
  };

  if (selectedArticle) {
    const author = getUserById(selectedArticle.authorId);
    
    return (
      <div className="p-4 lg:p-6">
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Knowledge Base
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <div className="mb-6 pb-6 border-b border-gray-200">
                <span className="text-sm text-blue-600 font-medium">{selectedArticle.category}</span>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">{selectedArticle.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {author?.name || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Updated {formatDate(selectedArticle.updatedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {selectedArticle.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {selectedArticle.helpful} found helpful
                  </span>
                </div>
              </div>

              <div className="prose max-w-none">
                {renderContent(selectedArticle.content)}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags.map(tag => (
                    <span key={tag} className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">Was this article helpful?</p>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    Yes
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <ThumbsUp className="w-4 h-4 rotate-180" />
                    No
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Related Articles</h3>
              <div className="space-y-3">
                {articles
                  .filter(a => a.category === selectedArticle.category && a.id !== selectedArticle.id)
                  .slice(0, 5)
                  .map(article => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{article.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{article.views} views</p>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-gray-500 mt-1">Find solutions, guides, and best practices</p>
      </div>

      {/* Search hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 lg:p-8 mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-4">How can we help you?</h2>
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for articles, guides, and solutions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50 text-gray-900"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-sm text-blue-100">Popular:</span>
          {['password', 'vpn', 'email', 'printer'].map(term => (
            <button
              key={term}
              onClick={() => setSearch(term)}
              className="text-sm px-3 py-1 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {search ? (
        // Search results
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Found <span className="font-medium text-gray-900">{filteredArticles.length}</span> articles
          </p>
          <div className="space-y-4">
            {filteredArticles.map(article => {
              const author = getUserById(article.authorId);
              return (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-blue-600 font-medium">{article.category}</span>
                      <h3 className="font-semibold text-gray-900 mt-1">{article.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {article.content.slice(0, 150)}...
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{author?.name}</span>
                        <span>{article.views} views</span>
                        <span>{article.helpful} helpful</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // Browse view
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Categories */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category === selectedCategory ? '' : category)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedCategory === category
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedCategory === category ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <BookOpen className={`w-5 h-5 ${
                        selectedCategory === category ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category}</h3>
                      <p className="text-sm text-gray-500">{articlesByCategory[category]?.length || 0} articles</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Articles list */}
            {selectedCategory && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">{selectedCategory}</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {articlesByCategory[selectedCategory]?.map(article => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900">{article.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {article.helpful}
                        </span>
                        <span>{formatDate(article.updatedAt)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular articles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Popular Articles
              </h3>
              <div className="space-y-3">
                {popularArticles.map((article, index) => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="w-full text-left flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="text-lg font-bold text-gray-300">{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{article.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{article.views.toLocaleString()} views</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Knowledge Base Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Articles</span>
                  <span className="text-sm font-semibold text-gray-900">{articles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Categories</span>
                  <span className="text-sm font-semibold text-gray-900">{categories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Views</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {articles.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
