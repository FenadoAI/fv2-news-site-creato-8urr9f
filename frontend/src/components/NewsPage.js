import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewsCard from './NewsCard';
import NewsFilters from './NewsFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Newspaper, AlertCircle } from 'lucide-react';

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

  // Load news on mount and when filters change
  useEffect(() => {
    if (categories.length > 0) {
      loadNews();
    }
  }, [selectedCategory, selectedCountry, categories]);

  const handleRefresh = () => {
    loadNews();
  };

  const SkeletonCard = () => (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-16 w-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-3">
              <Newspaper className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                News Hub
              </h1>
            </div>
            <p className="mt-2 text-gray-600">
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
        />
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Articles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="p-6 bg-white rounded-lg border border-slate-200">
                  <SkeletonCard />
                </div>
              ))
            : articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))
          }
        </div>

        {/* No articles message */}
        {!isLoading && articles.length === 0 && !error && (
          <div className="text-center py-12">
            <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">
              Try selecting a different category or country, or refresh to load new articles.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>News articles sourced from Google News RSS feeds</p>
            <p className="text-sm mt-2">
              {articles.length > 0 && `Showing ${articles.length} articles`}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewsPage;