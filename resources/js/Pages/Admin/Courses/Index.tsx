import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import AdminLayout from '@/Layouts/AdminLayout';
import { Course, Faculty, Major } from '../../../types';
import Icon from '../../../Components/Icon';
import {
  PageHeader,
  SearchFilterBar,
  Table, Thead, Tbody, Th, Td, EmptyState,
  Button,
  Modal,
  ConfirmationModal,
  FeedbackModal,
  Input, Label, Select, Badge
} from '../../../Components/ReusableUI';
import useTranslation from '../../../Hooks/useTranslation';

interface IndexProps {
  auth: any;
  courses: {
    data: Course[];
    links: any[];
    from: number;
    total: number;
  };
  faculties: Faculty[];
  majors: Major[];
  filters: {
    search?: string;
    faculty_id?: string;
    major_id?: string;
  };
  flash: {
    success?: string;
    error?: string;
  };
}

const CourseIndex: React.FC<IndexProps> = ({ auth, courses, faculties, majors, filters, flash = {} }) => {
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [facultyFilter, setFacultyFilter] = useState(filters.faculty_id || '');
  const [majorFilter, setMajorFilter] = useState(filters.major_id || '');

  const [feedback, setFeedback] = useState<{ isOpen: boolean; status: 'success' | 'error'; title: string; message: string; }>({
    isOpen: false, status: 'success', title: '', message: ''
  });

  useEffect(() => {
    if (flash?.success) setFeedback({ isOpen: true, status: 'success', title: 'Success!', message: flash.success });
    else if (flash?.error) setFeedback({ isOpen: true, status: 'error', title: 'Error!', message: flash.error });
  }, [flash]);

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    course_name: '',
    sks: 3,
    faculty_id: '',
    major_id: '',
    description: '',
  });

  const availableMajorsForForm = useMemo(() => {
    if (!data.faculty_id) return [];
    return majors.filter(m => String(m.faculty_id) === String(data.faculty_id));
  }, [data.faculty_id, majors]);

  const availableMajorsForFilter = useMemo(() => {
    if (!facultyFilter) return majors;
    return majors.filter(m => String(m.faculty_id) === String(facultyFilter));
  }, [facultyFilter, majors]);

  const handleOpenAddModal = () => {
    setModalMode('add');
    reset();
    clearErrors();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setModalMode('edit');
    setData({
        course_name: course.course_name,
        sks: course.sks,
        faculty_id: String(course.faculty_id),
        major_id: String(course.major_id),
        description: course.description || '',
    });
    clearErrors();
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      post(route('admin.courses.store'), { onSuccess: () => { setIsModalOpen(false); reset(); }, preserveScroll: true });
    } else if (selectedCourse) {
      put(route('admin.courses.update', selectedCourse.course_id), { onSuccess: () => { setIsModalOpen(false); reset(); }, preserveScroll: true });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedCourse) {
      destroy(route('admin.courses.destroy', selectedCourse.course_id), { onSuccess: () => setIsDeleteModalOpen(false), preserveScroll: true });
    }
  };

  const applyFilters = useCallback(
    debounce((search: string, facId: string, majId: string) => {
      router.get(
        route('admin.courses.index'),
        { search, faculty_id: facId, major_id: majId },
        { preserveState: true, replace: true }
      );
    }, 500), []
  );

  const onSearchChange = (val: string) => { setSearchQuery(val); applyFilters(val, facultyFilter, majorFilter); };
  const onFacultyFilterChange = (val: string) => { setFacultyFilter(val); setMajorFilter(''); applyFilters(searchQuery, val, ''); };
  const onMajorFilterChange = (val: string) => { setMajorFilter(val); applyFilters(searchQuery, facultyFilter, val); };
  const onFormFacultyChange = (val: string) => { setData(data => ({ ...data, faculty_id: val, major_id: '' })); };

  return (
    <AdminLayout user={auth.user}>
      <Head title={t('Manage Courses')} />

      <div className="flex flex-col gap-6 animate-fade-in-up relative">
        <PageHeader title={t('Courses Management')} subtitle={t('Manage master data of courses (subjects).')} actionLabel={t('Add Course')} onAction={handleOpenAddModal} />

        <SearchFilterBar searchValue={searchQuery} onSearchChange={onSearchChange} placeholder={t('Search code or name...')}>
            <div className="sm:w-48">
               <Select value={facultyFilter} onChange={(e) => onFacultyFilterChange(e.target.value)} className="bg-gray-50 dark:bg-background-dark h-12">
                 <option value="">{t('All Faculties')}</option>
                 {faculties.map(f => <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_name}</option>)}
               </Select>
            </div>
            <div className="sm:w-48">
               <Select value={majorFilter} onChange={(e) => onMajorFilterChange(e.target.value)} className="bg-gray-50 dark:bg-background-dark h-12">
                 <option value="">{t('All Majors')}</option>
                 {availableMajorsForFilter.map(m => <option key={m.major_id} value={m.major_id}>{m.major_name}</option>)}
               </Select>
            </div>
        </SearchFilterBar>

        <Table>
          <Thead>
              <Th>{t('Code')}</Th>
              <Th>{t('Name')}</Th>
              <Th>{t('Major')}</Th>
              <Th>{t('SKS')}</Th>
              <Th>{t('Actions')}</Th>
          </Thead>
          <Tbody>
            {courses.data.length > 0 ? courses.data.map((course) => (
                <tr key={course.course_id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50 transition-colors">
                  <Td className="font-mono font-bold text-primary">{course.course_code}</Td>
                  <Td className="font-medium text-gray-900 dark:text-white">{course.course_name}</Td>
                  <Td className="text-gray-600 dark:text-gray-300">{course.major?.major_name}</Td>
                  <Td><Badge variant="gray">{course.sks} SKS</Badge></Td>
                  <Td>
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleOpenEditModal(course)} className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1.5 transition-colors"><Icon name="edit" className="text-lg" /> Edit</button>
                      <button onClick={() => handleOpenDeleteModal(course)} className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1.5 transition-colors"><Icon name="delete" className="text-lg" /> Delete</button>
                    </div>
                  </Td>
                </tr>
              )) : <EmptyState message="No courses found." colSpan={5} />}
          </Tbody>
        </Table>

        {courses.links.length > 3 && (
            <div className="flex items-center justify-center p-4 gap-1 flex-wrap">
                {courses.links.map((link, key) => (
                    link.url === null ? <div key={key} className="px-3 py-1 text-sm text-gray-400 border rounded-lg" dangerouslySetInnerHTML={{ __html: link.label }} /> :
                    <Button key={key} variant={link.active ? 'primary' : 'ghost'} className={`h-9 px-3 ${link.active ? 'pointer-events-none' : ''}`} onClick={() => router.get(link.url!)}><span dangerouslySetInnerHTML={{ __html: link.label }} /></Button>
                ))}
            </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'add' ? 'Add New Course' : `Edit Course: ${selectedCourse?.course_code}`}
          maxWidth="max-w-2xl"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={processing}>Cancel</Button>
              <Button onClick={handleSubmit} isLoading={processing}>{modalMode === 'add' ? 'Save Course' : 'Update Course'}</Button>
            </>
          }
        >
          <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="course_name">Course Name</Label>
                      <Input type="text" id="course_name" value={data.course_name} onChange={(e) => setData('course_name', e.target.value)} placeholder="e.g. Algoritma dan Pemrograman" required />
                      {errors.course_name && <p className="text-sm text-red-500">{errors.course_name}</p>}
                  </div>

                  <div className="space-y-2">
                      <Label htmlFor="sks">Credits (SKS)</Label>
                      <Input type="number" id="sks" min="1" max="6" value={data.sks} onChange={(e) => setData('sks', parseInt(e.target.value) || 0)} required />
                      {errors.sks && <p className="text-sm text-red-500">{errors.sks}</p>}
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="faculty_id">Faculty</Label>
                      <Select id="faculty_id" value={data.faculty_id} onChange={(e) => onFormFacultyChange(e.target.value)} required>
                          <option value="" disabled>Select Faculty</option>
                          {faculties.map(f => <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_name}</option>)}
                      </Select>
                      {errors.faculty_id && <p className="text-sm text-red-500">{errors.faculty_id}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="major_id">Major</Label>
                      <Select id="major_id" value={data.major_id} onChange={(e) => setData('major_id', e.target.value)} required disabled={!data.faculty_id}>
                          <option value="" disabled>Select Major</option>
                          {availableMajorsForForm.map(m => <option key={m.major_id} value={m.major_id}>{m.major_name}</option>)}
                      </Select>
                      {errors.major_id && <p className="text-sm text-red-500">{errors.major_id}</p>}
                  </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input type="text" id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Short description..." />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
          </div>
        </Modal>

        <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} title="Delete Course?" message={<>Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedCourse?.course_name}</span>?</>} confirmLabel={processing ? "Deleting..." : "Delete"} variant="danger" />
        <FeedbackModal isOpen={feedback.isOpen} onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))} status={feedback.status} title={feedback.title} message={feedback.message} />
      </div>
    </AdminLayout>
  );
};

export default CourseIndex;
