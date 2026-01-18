import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import {
  PageHeader, SearchFilterBar, Badge, Card, Button,
  FeedbackModal, ConfirmationModal
} from '../../../Components/ReusableUI';
import Icon from '../../../Components/Icon';
import useTranslation from '../../../Hooks/useTranslation';

interface CreateProps {
    auth: any;
    krs: {
        krs_id: number;
        total_sks: number;
        status: string;
        items: any[];
    };
    availableClasses: any[];
    maxSks: number;
    flash: { success?: string; error?: string };
}

interface ClassItem {
    id: number;
    className: string;
    lecturer: string;
    day: string;
    start_time: string;
    end_time: string;
    room: string;
    enrolled: number;
    quota: number;
    isTaken: boolean;
    academicStatus: 'Normal' | 'Passed' | 'Retake';
    pastGrade: string | null;
}

const findCourseCategory = (courseCode: string, allCourses: any[]) => {
    const found = allCourses.find((c: any) => c.courseCode === courseCode);
    return found ? found.category : 'PILIHAN';
};

const KRSCreate: React.FC<CreateProps> = ({ auth, krs, availableClasses, maxSks, flash }) => {
  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const [feedback, setFeedback] = useState<{isOpen: boolean, status: 'success' | 'error', title: string, message: string}>({
    isOpen: false, status: 'success', title: '', message: ''
  });

  useEffect(() => {
    if (flash?.success) setFeedback({ isOpen: true, status: 'success', title: 'Success', message: flash.success });
    if (flash?.error) setFeedback({ isOpen: true, status: 'error', title: 'Error', message: flash.error });
  }, [flash]);

  const categories = [
      { id: 'WAJIB_PRODI', label: t('Major Compulsory'), icon: 'school', desc: 'Core major courses.' },
      { id: 'WAJIB_FAKULTAS', label: t('Faculty Compulsory'), icon: 'account_balance', desc: 'Basic faculty courses.' },
      { id: 'MKU', label: t('General Education'), icon: 'public', desc: 'Religion, Civics, etc.' },
      { id: 'PILIHAN', label: t('Elective Courses'), icon: 'interests', desc: 'Interest development.' },
  ];

  const getCategoryCourses = (category: string) => {
    const filtered = availableClasses.filter(cls => {
      const isCategory = cls.category === category;
      const matchesSearch = cls.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cls.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
      return isCategory && matchesSearch;
    });

    const uniqueCoursesMap = new Map();
    filtered.forEach(cls => {
        if (!uniqueCoursesMap.has(cls.courseCode)) {
            uniqueCoursesMap.set(cls.courseCode, {
                code: cls.courseCode,
                name: cls.courseName,
                sks: cls.sks,
                classes: []
            });
        }
        uniqueCoursesMap.get(cls.courseCode).classes.push(cls);
    });

    return Array.from(uniqueCoursesMap.values());
  };

  const toggleCategory = (category: string) => {
      setSelectedCategory(prev => prev === category ? null : category);
      setExpandedCourse(null);
  };

  const handleAddClass = (classId: number) => {
      router.post(route('student.krs.store'), { class_id: classId }, {
          preserveScroll: true,
          onError: (errors) => {
              setFeedback({ isOpen: true, status: 'error', title: 'Failed', message: errors.error || 'An error occurred.' });
          }
      });
  };

  const handleRemoveClass = (itemId: number) => {
      router.delete(route('student.krs.destroy', itemId), { preserveScroll: true });
  };

  const handleSubmitKRS = () => {
      router.post(route('student.krs.submit'), {}, {
          onSuccess: () => setIsSubmitModalOpen(false)
      });
  };

  const renderBottomButton = () => {
      if (krs.status === 'approved' || krs.status === 'paid') {
          return (
              <Button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white cursor-default shadow-none border-transparent" disabled>
                  <Icon name="check_circle" className="mr-2" /> {t('KRS Approved (Paid)')}
              </Button>
          );
      }

      if (krs.status === 'submitted') {
          return (
              <Button
                className="w-full mt-6"
                variant="warning"
                onClick={() => router.visit(route('student.bills.index'))}
              >
                  <Icon name="receipt_long" className="mr-2" /> {t('Waiting for Payment (Check Bill)')}
              </Button>
          );
      }

      return (
          <Button
              className="w-full mt-6"
              disabled={krs.items.length === 0}
              onClick={() => setIsSubmitModalOpen(true)}
          >
              {t('Checkout KRS')}
          </Button>
      );
  };

  return (
    <StudentLayout user={auth.user}>
        <Head title={t('Course Planning')} />

        <div className="flex flex-col gap-6 animate-fade-in-up">
        <PageHeader title={t('Course Planning (KRS)')} subtitle={t('Select courses for the current semester.')} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 flex flex-col gap-4">
                <SearchFilterBar searchValue={searchQuery} onSearchChange={setSearchQuery} placeholder={t('Search Courses...')} />

                {categories.map(cat => {
                    const isOpen = selectedCategory === cat.id;
                    const courses = getCategoryCourses(cat.id);
                    const count = courses.length;

                    return (
                        <div key={cat.id} className="flex flex-col">
                            <Card onClick={() => toggleCategory(cat.id)} className={`p-5 cursor-pointer hover:shadow-md transition-all flex justify-between items-center ${isOpen ? 'border-primary ring-1 ring-primary/20' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 rounded-lg flex items-center justify-center ${isOpen ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <Icon name={cat.icon} className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{cat.label}</h3>
                                        <p className="text-xs text-gray-500">{count} {t('Available Courses')}</p>
                                    </div>
                                </div>
                                <Icon name="expand_more" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </Card>

                            {isOpen && (
                                <div className="pl-4 mt-2 space-y-3 border-l-2 border-gray-200 ml-6">
                                    {courses.length > 0 ? courses.map((course: any) => {
                                        const firstClass = course.classes[0] as ClassItem;
                                        const isRetake = firstClass.academicStatus === 'Retake';
                                        const isPassed = firstClass.academicStatus === 'Passed';
                                        const grade = firstClass.pastGrade;

                                        return (
                                            <Card key={course.code} className="overflow-hidden">
                                                <div
                                                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    onClick={() => setExpandedCourse(expandedCourse === course.code ? null : course.code)}
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="font-bold text-gray-800 dark:text-white">{course.name}</h4>
                                                            {isRetake && <Badge variant="warning" className="text-[10px] px-1.5 py-0.5"><Icon name="refresh" className="text-[10px] mr-1"/>{t('Retake')} ({grade})</Badge>}
                                                            {isPassed && <Badge variant="success" className="text-[10px] px-1.5 py-0.5"><Icon name="check_circle" className="text-[10px] mr-1"/>{t('Passed')} ({grade})</Badge>}
                                                        </div>
                                                        <div className="flex gap-2 mt-1 text-xs text-gray-500">
                                                            <span className="bg-gray-100 dark:bg-gray-700 px-1.5 rounded">{course.code}</span>
                                                            <span>{course.sks} {t('SKS')}</span>
                                                        </div>
                                                    </div>
                                                    <Icon name="expand_more" className={`transition-transform ${expandedCourse === course.code ? 'rotate-180' : ''}`} />
                                                </div>

                                                {expandedCourse === course.code && (
                                                    <div className="bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
                                                        <table className="w-full text-sm text-left">
                                                            <thead className="bg-white dark:bg-gray-800 text-gray-500 border-b border-gray-200 dark:border-gray-700">
                                                                <tr>
                                                                    <th className="px-4 py-3 font-medium">{t('Class')}</th>
                                                                    <th className="px-4 py-3 font-medium">{t('Lecturer')}</th>
                                                                    <th className="px-4 py-3 font-medium">{t('Schedule')}</th>
                                                                    <th className="px-4 py-3 font-medium">{t('Room')}</th>
                                                                    <th className="px-4 py-3 font-medium text-right">{t('Quota')}</th>
                                                                    <th className="px-4 py-3 font-medium text-right">{t('Action')}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-[#19222c]">
                                                                {course.classes.map((cls: any) => {
                                                                    const isFull = cls.enrolled >= cls.quota;
                                                                    const isTaken = cls.isTaken;
                                                                    const isPassedStatus = cls.academicStatus === 'Passed';

                                                                    const isDisabled = (isFull && !isTaken) || isPassedStatus;

                                                                    return (
                                                                        <tr key={cls.id} className={isTaken ? 'bg-blue-50 dark:bg-blue-900/10' : ''}>
                                                                            <td className="px-4 py-3">
                                                                                <span className="font-bold text-gray-900 dark:text-white">{cls.className}</span>
                                                                                {isTaken && <Badge variant="primary" className="ml-2 text-[10px]">{t('Select')}</Badge>}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{cls.lecturer || '-'}</td>
                                                                            <td className="px-4 py-3">
                                                                                <div className="flex flex-col text-xs">
                                                                                    <span className="font-medium text-gray-900 dark:text-white">{cls.day}</span>
                                                                                    <span>{cls.start_time?.substring(0,5)} - {cls.end_time?.substring(0,5)}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{cls.room || 'TBA'}</td>
                                                                            <td className="px-4 py-3 text-right font-mono text-xs">
                                                                                <span className={isFull ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{cls.enrolled}</span>
                                                                                <span className="text-gray-400"> / {cls.quota}</span>
                                                                            </td>
                                                                            <td className="px-4 py-3 text-right">
                                                                                {isTaken ? (
                                                                                    <span className="text-xs font-bold text-primary">{t('Select')}</span>
                                                                                ) : (
                                                                                    <Button
                                                                                        variant={isPassedStatus ? "ghost" : "secondary"}
                                                                                        disabled={isDisabled}
                                                                                        className="h-7 px-3 text-xs"
                                                                                        onClick={() => handleAddClass(cls.id)}
                                                                                    >
                                                                                        {isPassedStatus ? t('Passed') : (isFull ? t('Full') : t('Select'))}
                                                                                    </Button>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </Card>
                                        );
                                    }) : <div className="p-4 text-gray-500 text-sm text-center">{t('No courses available in this category.')}</div>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="lg:col-span-1">
                <Card className="p-6 sticky top-24 border-t-4 border-t-primary">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">{t('Credit Summary')}</h3>
                    <div className="flex items-end gap-2 mb-2">
                        <span className={`text-4xl font-bold ${krs.total_sks > maxSks ? 'text-red-500' : 'text-primary'}`}>{krs.total_sks}</span>
                        <span className="text-gray-400 text-lg mb-1">/ {maxSks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                        <div className={`h-2 rounded-full transition-all ${krs.total_sks > maxSks ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${Math.min((krs.total_sks/maxSks)*100, 100)}%` }}></div>
                    </div>

                    <div className="border-t pt-4 border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold mb-3">{t('Selected Courses')} ({krs.items.length})</h4>
                        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                            {krs.items.map(item => {
                                const courseCode = item.class?.course?.course_code;
                                const category = findCourseCategory(courseCode, availableClasses);
                                const isMandatory = ['WAJIB_PRODI', 'WAJIB_FAKULTAS', 'MKU'].includes(category);

                                return (
                                    <div key={item.krs_item_id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex justify-between items-start border border-gray-200 dark:border-gray-700 group">
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-white line-clamp-1">
                                                {item.class?.course?.course_name || 'Unknown'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="primary" className="text-[10px] px-1.5 py-0">
                                                    {t('Class')} {item.class?.class_name || 'A'}
                                                </Badge>
                                                <span className="text-xs text-gray-500">{item.sks} {t('SKS')}</span>
                                                {isMandatory && <span className="text-[10px] text-orange-600 bg-orange-100 px-1 rounded font-bold border border-orange-200">{t('Mandatory')}</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <Icon name="schedule" className="text-[10px]" />
                                                {item.class?.day}, {item.class?.start_time?.substring(0,5)} - {item.class?.end_time?.substring(0,5)}
                                            </p>
                                        </div>

                                        {!isMandatory && (
                                            <button
                                                onClick={() => handleRemoveClass(item.krs_item_id)}
                                                className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                                title="Remove course"
                                            >
                                                <Icon name="close" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            {krs.items.length === 0 && <p className="text-sm text-gray-400 italic text-center">{t('No courses selected.')}</p>}
                        </div>
                    </div>

                    {renderBottomButton()}
                </Card>
            </div>
        </div>

        <ConfirmationModal
            isOpen={isSubmitModalOpen}
            onClose={() => setIsSubmitModalOpen(false)}
            onConfirm={handleSubmitKRS}
            title={t('Submit KRS?')}
            message={t('Ensure your study plan is correct. A bill will be generated upon submission.')}
            confirmLabel={t('Submit Now')}
        />

        <FeedbackModal
            isOpen={feedback.isOpen}
            onClose={() => setFeedback({...feedback, isOpen: false})}
            status={feedback.status}
            title={feedback.title}
            message={feedback.message}
        />
        </div>
    </StudentLayout>
  );
};

export default KRSCreate;
