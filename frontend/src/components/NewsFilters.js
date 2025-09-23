import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search, X } from 'lucide-react';

const NewsFilters = ({
  categories,
  countries,
  selectedCategory,
  selectedCountry,
  onCategoryChange,
  onCountryChange,
  onRefresh,
  isLoading,
  searchQuery,
  onSearchChange
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchChange && onSearchChange(localSearchQuery);
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    onSearchChange && onSearchChange('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-3 sm:mb-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search news articles..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10 sm:h-9 text-base sm:text-sm"
            />
            {localSearchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 sm:h-6 sm:w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-9 text-base sm:text-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCountry} onValueChange={onCountryChange}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-9 text-base sm:text-sm">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={onRefresh}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="w-full sm:w-auto h-10 sm:h-9 text-base sm:text-sm font-medium"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewsFilters;