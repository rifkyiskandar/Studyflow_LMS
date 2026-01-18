import React from 'react';
import { Card } from '../../Components/ReusableUI';
import Icon from '../../Components/Icon';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon?: string;

  color?: 'primary' | 'success' | 'warning' | 'info' | 'error';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title, value, trend, trendType = 'neutral', icon = 'analytics', color = 'primary'
}) => {

  const getIconColor = () => {
      switch(color) {
          case 'primary': return 'bg-primary/10 text-primary';
          case 'success': return 'bg-green-100 text-green-600';
          case 'warning': return 'bg-yellow-100 text-yellow-600';
          case 'info': return 'bg-blue-100 text-blue-600';

          case 'error': return 'bg-red-100 text-red-600';
          default: return 'bg-gray-100 text-gray-600';
      }
  };

  const getTrendColor = () => {
      if (trendType === 'positive') return 'text-green-500';
      if (trendType === 'negative') return 'text-red-500';
      return 'text-gray-500';
  };

  const getTrendIcon = () => {
      if (trendType === 'positive') return 'trending_up';
      if (trendType === 'negative') return 'trending_down';
      return 'remove';
  };

  return (
    <Card className="p-6 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
           <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
           <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${getIconColor()}`}>
           <Icon name={icon} className="text-2xl" />
        </div>
      </div>

      {trend && (
        <div className={`flex items-center text-xs font-medium ${getTrendColor()}`}>
           <Icon name={getTrendIcon()} className="text-base mr-1" />
           <span>{trend}</span>
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
