import React from 'react';
import Icon from '../../Components/Icon';

interface ActivityItem {
    id: number;
    user: string;
    action: string;
    amount?: number;
    time: string;
    avatar?: string;
}

interface RecentActivityProps {
    activities: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  if (activities.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Icon name="history" className="text-4xl mb-2 opacity-50" />
              <p className="text-sm">No recent activity found.</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col">
      {activities.map((activity, index) => (
        <div key={activity.id} className={`flex items-start gap-4 py-4 ${index !== activities.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
           {/* Avatar / Icon */}
           <div className="flex-shrink-0">
               {activity.avatar ? (
                   <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${activity.avatar})` }}></div>
               ) : (
                   <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                       <span className="font-bold text-sm">{activity.user.charAt(0)}</span>
                   </div>
               )}
           </div>

           {/* Content */}
           <div className="flex-1">
               <p className="text-sm text-gray-900 dark:text-white">
                   <span className="font-bold">{activity.user}</span> {activity.action}
                   {activity.amount && <span className="font-mono text-primary ml-1 font-bold">{formatCurrency(activity.amount)}</span>}
               </p>
               <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                   <Icon name="schedule" className="text-[14px]" />
                   {activity.time}
               </p>
           </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;
