import React from 'react';
import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import StatsCard from '../Admin/StatsCard';
import { PageHeader, Card, Badge, Button } from '../../Components/ReusableUI';
import Icon from '../../Components/Icon';
import useTranslation from '../../Hooks/useTranslation';

interface DashboardProps {
    auth: any;
    student: any;
    dashboardData: {
        semester_level: number;
        status: string;
        sks_taken: number;
        max_sks: number;
        unpaid_bill: number;
        gpa: number;
        active_semester_name: string;
    };
}

const StudentDashboard: React.FC<DashboardProps> = ({ auth, student, dashboardData }) => {
  const profile = student.student_profile;
  const { t } = useTranslation();
  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <StudentLayout user={student}>
      <Head title={t('Dashboard')} />

      <div className="space-y-8 animate-fade-in-up">

        <div className="bg-white dark:bg-[#19222c] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
           <div
              className="size-20 rounded-full bg-gray-200 dark:bg-gray-700 bg-cover bg-center border-2 border-primary flex-shrink-0 flex items-center justify-center text-3xl font-bold text-gray-400"
              style={student.profile_picture ? { backgroundImage: `url(${student.profile_picture})` } : {}}
           >
              {!student.profile_picture && student.full_name.charAt(0)}
           </div>

           <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Welcome back')}, {student.full_name}</h1>
              <p className="text-gray-500 dark:text-gray-400">
                  {profile?.student_number || 'No NIM'} • {profile?.major?.major_name || 'No Major'}
              </p>

              <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                  <Badge variant="primary">Semester {dashboardData.semester_level}</Badge>
              </div>
           </div>

           <div className="flex gap-2">

           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatsCard
            title="GPA"
            value={dashboardData.gpa.toString()}
            trend="Cum Laude"
            trendType="positive"
            icon="grade"
            color="primary"
          />
           <StatsCard
            title={t('Credits Taken')}
            value={dashboardData.sks_taken.toString()}
            trend={t('This Semester')}
            trendType="neutral"
            icon="school"
            color="info"
          />
          <StatsCard
            title="Max Credits"
            value={`${dashboardData.max_sks}`}
            trend="Credit Limit"
            trendType="neutral"
            icon="speed"
            color="warning"
          />
           <StatsCard
            title="Unpaid Bill"
            value={formatRupiah(dashboardData.unpaid_bill)}
            trend={dashboardData.unpaid_bill > 0 ? "Pay Immediately" : "Paid"}
            trendType={dashboardData.unpaid_bill > 0 ? "negative" : "positive"}
            icon="payments"
            color={dashboardData.unpaid_bill > 0 ? "error" : "success"}
          />
        </div>

        <Card className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Icon name="school" className="text-primary" />
                      {t('Current Academic Status')}
                  </h3>
                  <Badge variant="primary">{dashboardData.active_semester_name}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                       <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/50">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cumulative GPA</p>
                          <p className="font-bold text-gray-900 dark:text-white text-2xl">{dashboardData.gpa}</p>
                      </div>
                  </div>
                  <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Credits Taken (This Semester)</p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(dashboardData.sks_taken / dashboardData.max_sks) * 100}%` }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                               <span>{dashboardData.sks_taken} Credits</span>
                               <span>Max {dashboardData.max_sks} Credits</span>
                          </div>
                      </div>
                      <Button className="w-full" icon="edit_document" onClick={() => router.visit(route('student.krs.create'))}>
                          View / Plan Courses (KRS)
                      </Button>
                  </div>
              </div>
          </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
