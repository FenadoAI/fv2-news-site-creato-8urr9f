import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewsCard from './NewsCard';
import NewsFilters from './NewsFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Newspaper, AlertCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api`;

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState([]);

  // Load categories and countries
  useEffect(() => {
    const loadCategoriesAndCountries = async () => {
      try {
        const response = await axios.get(`${API}/news/categories`);
        if (response.data.success) {
          setCategories(response.data.categories);
          setCountries(response.data.countries);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load news categories');
      }
    };

    loadCategoriesAndCountries();
  }, []);

  // Load news articles
  const loadNews = async (category = selectedCategory, country = selectedCountry) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API}/news`, {
        category,
        country,
        limit: 20
      });

      if (response.data.success) {
        setArticles(response.data.articles);
        setFilteredArticles(response.data.articles);
      } else {
        setError(response.data.error || 'Failed to load news');
      }
    } catch (err) {
      console.error('Failed to load news:', err);
      setError('Failed to load news articles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredArticles(articles);
      return;
    }

    const filtered = articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.source.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredArticles(filtered);
  }, [searchQuery, articles]);

  // Load news on mount and when filters change
  useEffect(() => {
    if (categories.length > 0) {
      loadNews();
    }
  }, [selectedCategory, selectedCountry, categories]);

  const handleRefresh = () => {
    loadNews();
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Newspaper className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  News Hub
                </h1>
              </div>
              <ThemeToggle />
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Stay updated with the latest news from around the world
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {categories.length > 0 && (
        <NewsFilters
          categories={categories}
          countries={countries}
          selectedCategory={selectedCategory}
          selectedCountry={selectedCountry}
          onCategoryChange={setSelectedCategory}
          onCountryChange={setSelectedCountry}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Articles Grid */}
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 12 }, (_, i) => (
                <SkeletonCard key={i} />
              ))
            : filteredArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))
          }
        </div>

        {/* No articles message */}
        {!isLoading && filteredArticles.length === 0 && !error && (
          <div className="text-center py-12">
            <Newspaper className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {articles.length === 0 ? 'No articles found' : 'No articles match your search'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {articles.length === 0
                ? 'Try selecting a different category or country, or refresh to load new articles.'
                : 'Try adjusting your search query or clearing the search to see all articles.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>News articles sourced from Google News RSS feeds</p>
            <p className="text-sm mt-2">
              {filteredArticles.length > 0 && `Showing ${filteredArticles.length} of ${articles.length} articles`}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewsPage;