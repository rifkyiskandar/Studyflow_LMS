import React, { useState, useMemo, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import {
  PageHeader,
  SearchFilterBar,
  Badge,
  Card
} from '../../../Components/ReusableUI';
import Icon from '../../../Components/Icon';

interface CatalogItem {
  id: number;
  code: string;
  name: string;
  sks: number;
  semester: number;
  category: string;
  status: 'Passed' | 'Taken' | 'Available';
  grade: string;
  prerequisite?: string;
}

interface CatalogProps {
    auth: any;
    catalog: CatalogItem[];
}

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const CatalogIndex: React.FC<CatalogProps> = ({ auth, catalog }) => {
  const [expandedSemesters, setExpandedSemesters] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = useMemo(() => {
    return catalog.filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            course.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [catalog, searchQuery]);

  useEffect(() => {
    if (searchQuery) {
        const matchingSemesters = Array.from(new Set(filteredCourses.map(c => c.semester)));
        setExpandedSemesters(matchingSemesters);
    } else {
        setExpandedSemesters([]);
    }
  }, [searchQuery, filteredCourses]);

  const toggleSemester = (sem: number) => {
    setExpandedSemesters(prev =>
      prev.includes(sem) ? prev.filter(s => s !== sem) : [...prev, sem]
    );
  };

  const getStatusBadgeVariant = (status: string, grade: string) => {
    if (status === 'Passed') return 'success';
    if (status === 'Taken') return 'primary';
    if (status === 'Available' && grade !== '-') return 'warning';
    return 'gray';
  };

  const formatCategory = (cat: string) => {
      const map: Record<string, string> = {
          'WAJIB_PRODI': 'Major Compulsory',
          'WAJIB_FAKULTAS': 'Faculty Compulsory',
          'MKU': 'General Course',
          'PILIHAN': 'Elective'
      };
      return map[cat] || cat.replace(/_/g, ' ');
  };

  return (
    <StudentLayout user={auth.user}>
        <Head title="Course Catalog" />

        <div className="flex flex-col gap-6 animate-fade-in-up">
        <PageHeader
            title="Course Catalog"
            subtitle="Complete curriculum roadmap for your Study Program."
        />

        <SearchFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search by code or course name..."
        />

        <div className="space-y-4">
            {SEMESTERS.map(sem => {
                const semesterCourses = filteredCourses.filter(c => c.semester === sem);
                const totalSks = semesterCourses.reduce((acc, curr) => acc + curr.sks, 0);
                const isExpanded = expandedSemesters.includes(sem);

                if (searchQuery && semesterCourses.length === 0) return null;

                return (
                    <Card key={sem} className="overflow-hidden transition-all duration-200">
                        <button
                            onClick={() => toggleSemester(sem)}
                            className={`w-full px-6 py-4 flex justify-between items-center transition-colors ${isExpanded ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-1 rounded-full transition-transform duration-200 ${isExpanded ? 'rotate-90 text-primary' : 'text-gray-400'}`}>
                                    <Icon name="chevron_right" />
                                </div>
                                <h3 className={`font-bold text-lg ${isExpanded ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                                    Semester {sem}
                                </h3>
                            </div>
                            <Badge variant="gray">{totalSks} Total Credits</Badge>
                        </button>

                        {isExpanded && (
                            <div className="border-t border-gray-100 dark:border-gray-800 animate-fade-in">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-background-dark/30 border-b border-gray-100 dark:border-gray-800">
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Course Name</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Credits</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {semesterCourses.length > 0 ? (
                                                semesterCourses.map(course => (
                                                    <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50">
                                                        <td className="px-6 py-4 text-sm font-mono font-bold text-gray-700 dark:text-gray-300">{course.code}</td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{course.name}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{course.sks}</td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant="gray">{formatCategory(course.category)}</Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant={getStatusBadgeVariant(course.status, course.grade)}>
                                                                {course.status === 'Passed' ? `Passed (${course.grade})` :
                                                                 course.status === 'Taken' ? 'In Progress' :
                                                                 course.grade !== '-' ? `Retake (${course.grade})` : 'Available'}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                                                        No courses listed for this semester.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </Card>
                )
            })}
        </div>
        </div>
    </StudentLayout>
  );
};

export default CatalogIndex;
