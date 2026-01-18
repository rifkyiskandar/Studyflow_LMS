import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatsCard from './StatsCard';
import { PageHeader, Card, Badge } from '../../Components/ReusableUI';
import Icon from '../../Components/Icon';
import useTranslation from '@/Hooks/useTranslation';

interface PaymentItem {
    id: number;
    order_id: string;
    student_name: string;
    amount: number;
    status: string;
    date: string;
}

interface DashboardProps {
    auth: any;
    stats: {
        students: { total: number; new_this_month: number; };
        lecturers: { total: number; };
        courses: { total: number; };
    };
    recentPayments: PaymentItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ auth, stats, recentPayments }) => {
  const { t } = useTranslation();

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusVariant = (status: string) => {
      switch (status) {
          case 'settlement': case 'capture': case 'paid': return 'success';
          case 'pending': return 'warning';
          case 'deny': case 'expire': case 'cancel': return 'error';
          default: return 'gray';
      }
  };

  return (
    <AdminLayout user={auth.user}>
      <Head title={t('Dashboard')} />

      <div className="space-y-8 animate-fade-in-up">
        <PageHeader
          title={t('Dashboard')}
          subtitle={`${t('Welcome back')}, ${auth.user.full_name}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title={t('Total Students')}
            value={stats.students.total.toLocaleString()}
            trend={stats.students.new_this_month > 0
                ? `+${stats.students.new_this_month} ${t('this month')}`
                : t('No new students')}
            trendType={stats.students.new_this_month > 0 ? "positive" : "neutral"}
            icon="school"
            color="info"
          />
          <StatsCard
            title={t('Total Instructors')}
            value={stats.lecturers.total.toLocaleString()}
            trend={t('Active Faculty')}
            trendType="neutral"
            icon="cast_for_education"
            color="warning"
          />
          <StatsCard
            title={t('Active Courses')}
            value={stats.courses.total.toString()}
            trend={t('Current Curriculum')}
            trendType="neutral"
            icon="menu_book"
            color="primary"
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {t('Recent Payments')}
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('Order ID')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('Student')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('Date')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('Status')}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{t('Amount')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#19222c]">
                            {recentPayments && recentPayments.length > 0 ? (
                                recentPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-gray-500">{payment.order_id}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{payment.student_name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(payment.date)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusVariant(payment.status)} className="uppercase text-[10px]">
                                                {payment.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white font-mono">
                                            {formatRupiah(payment.amount)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center flex flex-col items-center justify-center text-gray-400 italic w-full">
                                        <Icon name="history" className="text-4xl mb-2 opacity-20" />
                                        <span>{t('No recent payment activity found.')}</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
