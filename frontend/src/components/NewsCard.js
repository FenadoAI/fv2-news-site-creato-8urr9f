import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Globe } from 'lucide-react';

const NewsCard = ({ article }) => {
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

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-slate-200 hover:border-slate-300">
      <CardHeader onClick={handleCardClick} className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </CardTitle>
          <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            <span className="font-medium">{article.source}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.published)}</span>
          </div>
        </div>

        {article.category && (
          <Badge variant="secondary" className="w-fit text-xs">
            {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
          </Badge>
        )}
      </CardHeader>

      {article.description && (
        <CardContent onClick={handleCardClick} className="pt-0">
          <CardDescription className="text-sm leading-relaxed line-clamp-3">
            {article.description.replace(/<[^>]*>/g, '')} {/* Remove HTML tags */}
          </CardDescription>
        </CardContent>
      )}
    </Card>
  );
};

export default NewsCard;