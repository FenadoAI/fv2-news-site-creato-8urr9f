import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Globe, ImageIcon } from 'lucide-react';

const NewsCard = ({ article }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCardClick = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Use Unsplash for placeholder images based on category
  const getPlaceholderImage = (category) => {
    const categoryImages = {
      technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop',
      business: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
      sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=200&fit=crop',
      entertainment: 'https://images.unsplash.com/photo-1489599255309-17aeabdc29e8?w=400&h=200&fit=crop',
      health: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
      science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=200&fit=crop',
      general: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop',
      world: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
      nation: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=200&fit=crop'
    };
    return categoryImages[category] || categoryImages.general;
  };

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 overflow-hidden">
      {/* Image Section */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {!imageError && article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            onClick={handleCardClick}
          />
        ) : (
          <img
            src={getPlaceholderImage(article.category)}
            alt={`${article.category} news`}
            className="w-full h-full object-cover"
            onClick={handleCardClick}
          />
        )}

        {/* Loading skeleton for image */}
        {imageLoading && !imageError && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-slate-400" />
          </div>
        )}

        {/* Category badge overlay */}
        {article.category && (
          <Badge variant="secondary" className="absolute top-3 left-3 text-xs bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
            {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
          </Badge>
        )}
      </div>

      <CardHeader onClick={handleCardClick} className="space-y-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </CardTitle>
          <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span className="font-medium">{article.source}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(article.published)}</span>
          </div>
        </div>
      </CardHeader>

      {article.description && (
        <CardContent onClick={handleCardClick} className="pt-0 pb-4">
          <CardDescription className="text-sm leading-relaxed line-clamp-3">
            {article.description.replace(/<[^>]*>/g, '')} {/* Remove HTML tags */}
          </CardDescription>
        </CardContent>
      )}
    </Card>
  );
};

export default NewsCard;