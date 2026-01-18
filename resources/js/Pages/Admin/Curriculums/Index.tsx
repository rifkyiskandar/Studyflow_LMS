import React, { useState, useMemo, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Faculty, Major, Course, Curriculum } from '../../../types';
import Icon from '../../../Components/Icon';
import {
  PageHeader, SearchFilterBar, Card, Badge, Button, Modal, ConfirmationModal,
  FeedbackModal, Label, Select
} from '../../../Components/ReusableUI';

interface IndexProps {
  auth: any;
  view_mode: 'list_majors' | 'detail_curriculum';

  majors?: Major[];
  filters?: { search?: string };
  allFaculties?: Faculty[];
  allCourses?: Course[];

  selected_major?: Major;
  curriculums?: Curriculum[];
  courses?: Course[];

  flash: { success?: string; error?: string; };
}

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const CurriculumIndex: React.FC<IndexProps> = ({
    auth, view_mode,
    majors = [], filters = {}, allFaculties = [], allCourses = [],
    selected_major, curriculums = [], courses = [],
    flash = {}
}) => {

  const [feedback, setFeedback] = useState<{ isOpen: boolean; status: 'success' | 'error'; title: string; message: string; }>({
    isOpen: false, status: 'success', title: '', message: ''
  });


  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [facultyFilter, setFacultyFilter] = useState('');


  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkScope, setBulkScope] = useState<'university' | 'faculty'>('university');


  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<number | null>(null);

  useEffect(() => {
    if (flash?.success) setFeedback({ isOpen: true, status: 'success', title: 'Success!', message: flash.success });
    else if (flash?.error) setFeedback({ isOpen: true, status: 'error', title: 'Error!', message: flash.error });
  }, [flash]);

  const { data, setData, post, processing, reset, errors } = useForm({
    major_id: selected_major?.major_id,
    course_id: '',
    semester: '1',
    category: 'WAJIB_PRODI',
    scope: '',
    target_faculty_id: '',
  });

  const handleSearch = (e: string) => { setSearchQuery(e); };


  const filteredMajors = useMemo(() => {
      return majors.filter(m => {
          const matchesSearch = m.major_name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesFaculty = facultyFilter ? String(m.faculty_id) === facultyFilter : true;
          return matchesSearch && matchesFaculty;
      });
  }, [majors, searchQuery, facultyFilter]);

  const handleOpenBulkModal = () => {
      reset();
      setData(prev => ({ ...prev, scope: 'university', category: 'MKU' }));
      setIsBulkModalOpen(true);
  };

  const submitBulk = (e: React.FormEvent) => {
      e.preventDefault();
      data.scope = bulkScope;
      post(route('admin.curriculums.store'), { onSuccess: () => { setIsBulkModalOpen(false); reset(); } });
  };

  const handleOpenAddModal = () => {
      reset();
      setData(prev => ({ ...prev, major_id: selected_major?.major_id, course_id: '', semester: '1', category: 'WAJIB_PRODI' }));
      setIsAddModalOpen(true);
  };

  const submitSingle = (e: React.FormEvent) => {
      e.preventDefault();
      post(route('admin.curriculums.store'), { onSuccess: () => { setIsAddModalOpen(false); reset(); } });
  };

  const handleDeleteClick = (id: number) => {
      setSelectedCurriculumId(id);
      setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
      if (selectedCurriculumId) {
          router.delete(route('admin.curriculums.destroy', selectedCurriculumId), { onSuccess: () => setIsDeleteModalOpen(false) });
      }
  };

  const getCategoryBadge = (cat: string) => {
      if (cat === 'WAJIB_PRODI') return 'primary';
      if (cat === 'WAJIB_FAKULTAS') return 'info';
      if (cat === 'MKU') return 'warning';
      return 'gray';
  };


  if (view_mode === 'list_majors') {
      return (
        <AdminLayout user={auth.user}>
            <Head title="Curriculum Management" />
            <div className="flex flex-col gap-6 animate-fade-in-up relative">

                {/* HEADER SECTION: Title & Assign Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Curriculum Management</h1>
                        <p className="text-gray-500 dark:text-gray-400">Select a major to manage its semester curriculum.</p>
                    </div>
                    {/* Tombol Assign Shared Course ada di sini (Samping Title) */}
                    <Button onClick={handleOpenBulkModal} icon="playlist_add" variant="primary">
                        Assign Shared Course
                    </Button>
                </div>

                {/* SEARCH & FILTER SECTION */}
                <SearchFilterBar searchValue={searchQuery} onSearchChange={handleSearch} placeholder="Search majors...">
                    {/* Filter Fakultas ada di sini (Samping Search) */}
                    <div className="sm:w-64">
                        <Select
                            value={facultyFilter}
                            onChange={(e) => setFacultyFilter(e.target.value)}
                            className="bg-gray-50 dark:bg-background-dark h-12"
                        >
                            <option value="">All Faculties</option>
                            {allFaculties?.map(f => (
                                <option key={f.faculty_id} value={String(f.faculty_id)}>{f.faculty_name}</option>
                            ))}
                        </Select>
                    </div>
                </SearchFilterBar>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMajors.length > 0 ? (
                        filteredMajors.map(major => (
                            <Card
                                key={major.major_id}
                                onClick={() => router.get(route('admin.curriculums.index', { major_id: major.major_id }))}
                                className="group p-6 hover:border-primary/50 cursor-pointer transition-all hover:shadow-md"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Icon name="school" className="text-2xl" />
                                    </div>
                                    <Icon name="arrow_forward" className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{major.major_name}</h3>
                                <p className="text-sm text-gray-500">{major.faculty?.faculty_name}</p>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500">
                            <Icon name="search_off" className="text-4xl mb-2" />
                            <p>No majors found matching your criteria.</p>
                        </div>
                    )}
                </div>

                {/* Bulk Assign Modal */}
                <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} title="Assign Shared Course" footer={<><Button variant="secondary" onClick={() => setIsBulkModalOpen(false)}>Cancel</Button><Button onClick={submitBulk} isLoading={processing}>Assign Course</Button></>}>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200 flex gap-2">
                            <Icon name="info" className="text-lg" />
                            <p>Use this to assign General Courses (MKU) or Faculty Courses to multiple majors at once.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Assign To (Scope)</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="scope" checked={bulkScope === 'university'} onChange={() => setBulkScope('university')} className="text-primary focus:ring-primary"/>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">All Majors (University Wide)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="scope" checked={bulkScope === 'faculty'} onChange={() => setBulkScope('faculty')} className="text-primary focus:ring-primary"/>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Specific Faculty</span>
                                </label>
                            </div>
                        </div>
                        {bulkScope === 'faculty' && (
                            <div className="space-y-2 animate-fade-in">
                                <Label>Select Faculty</Label>
                                <Select value={data.target_faculty_id} onChange={e => setData('target_faculty_id', e.target.value)}>
                                    <option value="" disabled>Choose Faculty...</option>
                                    {allFaculties?.map(f => <option key={f.faculty_id} value={String(f.faculty_id)}>{f.faculty_name}</option>)}
                                </Select>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Semester</Label>
                                <Select value={data.semester} onChange={e => setData('semester', e.target.value)}>
                                    {SEMESTERS.map(s => <option key={s} value={String(s)}>{s}</option>)}
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={data.category} onChange={e => setData('category', e.target.value)}>
                                    <option value="MKU">MKU (General)</option>
                                    <option value="WAJIB_FAKULTAS">Faculty Mandatory</option>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Select Course</Label>
                            <Select value={data.course_id} onChange={e => setData('course_id', e.target.value)} required>
                                <option value="" disabled>Choose Course...</option>
                                {allCourses?.map(c => <option key={c.course_id} value={String(c.course_id)}>{c.course_code} - {c.course_name} ({c.sks} SKS)</option>)}
                            </Select>
                        </div>
                    </div>
                </Modal>

                <FeedbackModal isOpen={feedback.isOpen} onClose={() => setFeedback({...feedback, isOpen: false})} status={feedback.status} title={feedback.title} message={feedback.message} />
            </div>
        </AdminLayout>
      );
  }


  return (
    <AdminLayout user={auth.user}>
        <Head title={`Curriculum: ${selected_major?.major_name}`} />
        <div className="flex flex-col gap-6 animate-fade-in-up relative">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="secondary" onClick={() => router.get(route('admin.curriculums.index'))} className="p-2">
                        <Icon name="arrow_back" className="text-xl" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selected_major?.major_name}</h1>
                        <p className="text-gray-500">Curriculum Structure</p>
                    </div>
                </div>
                <Button onClick={handleOpenAddModal} icon="add">Add Course</Button>
            </div>

            <div className="flex flex-col gap-6">
                {SEMESTERS.map(sem => {
                    const semItems = curriculums?.filter(c => c.semester === sem) || [];
                    const totalSks = semItems.reduce((sum, item) => sum + (item.course?.sks || 0), 0);

                    return (
                        <Card key={sem} className="flex flex-col overflow-hidden transition-all hover:shadow-md border border-gray-200 dark:border-gray-800">
                            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Semester {sem}</h3>
                                <Badge variant="primary">{totalSks} SKS</Badge>
                            </div>
                            <div className="p-0">
                                {semItems.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 uppercase bg-white dark:bg-transparent">
                                                <th className="px-6 py-3 w-24">Code</th>
                                                <th className="px-6 py-3 w-full">Course Name</th>
                                                <th className="px-6 py-3 w-20">SKS</th>
                                                <th className="px-6 py-3 w-32">Category</th>
                                                <th className="px-6 py-3 w-20 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {semItems.map(item => (
                                                <tr key={item.curriculum_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                                    <td className="px-6 py-3 font-mono text-xs font-bold text-gray-600 dark:text-gray-400">
                                                        {item.course?.course_code}
                                                    </td>
                                                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                                                        {item.course?.course_name}
                                                    </td>
                                                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                        {item.course?.sks}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <Badge variant={getCategoryBadge(item.category)}>
                                                            {item.category.replace('_', ' ')}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <button
                                                            onClick={() => handleDeleteClick(item.curriculum_id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                                            title="Remove"
                                                        >
                                                            <Icon name="close" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-gray-400 italic text-sm bg-white dark:bg-transparent">
                                        No courses assigned.
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Add Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Course to Curriculum" footer={<><Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button><Button onClick={submitSingle} isLoading={processing}>Add</Button></>}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select Course</Label>
                        <Select value={data.course_id} onChange={e => setData('course_id', e.target.value)} required>
                            <option value="" disabled>Choose Course...</option>
                            {courses?.map(c => <option key={c.course_id} value={String(c.course_id)}>{c.course_code} - {c.course_name} ({c.sks} SKS)</option>)}
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Select value={data.semester} onChange={e => setData('semester', e.target.value)}>
                                {SEMESTERS.map(s => <option key={s} value={String(s)}>{s}</option>)}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={data.category} onChange={e => setData('category', e.target.value)}>
                                <option value="WAJIB_PRODI">Wajib Prodi</option>
                                <option value="WAJIB_FAKULTAS">Wajib Fakultas</option>
                                <option value="MKU">MKU</option>
                                <option value="PILIHAN">Pilihan</option>
                            </Select>
                        </div>
                    </div>
                </div>
            </Modal>

            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Remove Course?" message="Are you sure you want to remove this course from the curriculum?" confirmLabel="Remove" variant="danger" />
            <FeedbackModal isOpen={feedback.isOpen} onClose={() => setFeedback({...feedback, isOpen: false})} status={feedback.status} title={feedback.title} message={feedback.message} />
        </div>
    </AdminLayout>
  );
};

export default CurriculumIndex;
