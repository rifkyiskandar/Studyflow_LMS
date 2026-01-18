import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import AdminLayout from '@/Layouts/AdminLayout';
import { CourseClass, Course, Semester, Room, User } from '../../../types';
import Icon from '../../../Components/Icon';
import {
  PageHeader, SearchFilterBar, Table, Thead, Tbody, Th, Td, EmptyState,
  Button, Modal, ConfirmationModal, FeedbackModal, Input, Label, Select, Badge
} from '../../../Components/ReusableUI';

interface IndexProps {
  auth: any;
  classes: { data: CourseClass[]; links: any[]; from: number; total: number; };
  courses: Course[];
  lecturers: User[];
  rooms: Room[];
  semesters: Semester[];
  filters: { search?: string; semester_id?: string; course_id?: string; };
  flash: { success?: string; error?: string; };
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ClassIndex: React.FC<IndexProps> = ({ auth, classes, courses, lecturers, rooms, semesters, filters, flash = {} }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedClass, setSelectedClass] = useState<CourseClass | null>(null);

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [semesterFilter, setSemesterFilter] = useState(filters.semester_id || '');
  const [courseFilter, setCourseFilter] = useState(filters.course_id || '');

  const [feedback, setFeedback] = useState<{ isOpen: boolean; status: 'success' | 'error'; title: string; message: string; }>({
    isOpen: false, status: 'success', title: '', message: ''
  });

  useEffect(() => {
    if (flash?.success) setFeedback({ isOpen: true, status: 'success', title: 'Success!', message: flash.success });
    else if (flash?.error) setFeedback({ isOpen: true, status: 'error', title: 'Error!', message: flash.error });
  }, [flash]);

  const activeSemesterId = useMemo(() => semesters.find(s => s.is_active)?.semester_id || '', [semesters]);


  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    class_name: '',
    course_id: '',
    lecturer_id: '',
    semester_id: String(activeSemesterId),
    room_id: '',
    day: 'Monday',
    start_time: '08:00',
    end_time: '10:00',
  });

  const handleOpenAddModal = () => {
    setModalMode('add');
    reset();
    setData('semester_id', String(activeSemesterId));
    clearErrors();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cls: CourseClass) => {
    setModalMode('edit');
    setData({
        class_name: cls.class_name || '',
        course_id: String(cls.course_id),
        lecturer_id: String(cls.lecturer_id),
        semester_id: String(cls.semester_id),
        room_id: String(cls.room_id),
        day: cls.day,

        start_time: cls.start_time.substring(0, 5),
        end_time: cls.end_time.substring(0, 5),
    });
    clearErrors();
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (cls: CourseClass) => {
    setSelectedClass(cls);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      post(route('admin.classes.store'), { onSuccess: () => { setIsModalOpen(false); reset(); }, preserveScroll: true });
    } else if (selectedClass) {
      put(route('admin.classes.update', selectedClass.class_id), { onSuccess: () => { setIsModalOpen(false); reset(); }, preserveScroll: true });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedClass) {
      destroy(route('admin.classes.destroy', selectedClass.class_id), { onSuccess: () => setIsDeleteModalOpen(false), preserveScroll: true });
    }
  };

  const applyFilters = useCallback(
    debounce((search: string, semId: string, crsId: string) => {
      router.get(
        route('admin.classes.index'),
        { search, semester_id: semId, course_id: crsId },
        { preserveState: true, replace: true }
      );
    }, 500), []
  );

  const onSearchChange = (val: string) => { setSearchQuery(val); applyFilters(val, semesterFilter, courseFilter); };
  const onSemesterFilterChange = (val: string) => { setSemesterFilter(val); applyFilters(searchQuery, val, courseFilter); };
  const onCourseFilterChange = (val: string) => { setCourseFilter(val); applyFilters(searchQuery, semesterFilter, val); };

  return (
    <AdminLayout user={auth.user}>
      <Head title="Class Schedules" />

      <div className="flex flex-col gap-6 animate-fade-in-up relative">
        <PageHeader title="Class Schedules" subtitle="Manage class timetables, rooms, and lecturers." actionLabel="Create Schedule" onAction={handleOpenAddModal} />

        <SearchFilterBar searchValue={searchQuery} onSearchChange={onSearchChange} placeholder="Search course or lecturer...">
            <div className="sm:w-48">
               <Select value={semesterFilter} onChange={(e) => onSemesterFilterChange(e.target.value)} className="bg-gray-50 dark:bg-background-dark h-12">
                 <option value="">All Semesters</option>
                 {semesters.map(s => <option key={s.semester_id} value={s.semester_id}>{s.semester_name} {s.is_active ? '(Active)' : ''}</option>)}
               </Select>
            </div>
            <div className="sm:w-48">
               <Select value={courseFilter} onChange={(e) => onCourseFilterChange(e.target.value)} className="bg-gray-50 dark:bg-background-dark h-12">
                 <option value="">All Courses</option>
                 {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
               </Select>
            </div>
        </SearchFilterBar>

        <Table>
          <Thead>
              <Th>Course</Th>
              <Th>Class Info</Th>
              <Th>Schedule</Th>
              <Th>Lecturer</Th>
              <Th>Semester</Th>
              <Th>Actions</Th>
          </Thead>
          <Tbody>
            {classes.data.length > 0 ? classes.data.map((cls) => (
                <tr key={cls.class_id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50 transition-colors">
                  <Td>
                      <div className="font-bold text-gray-900 dark:text-white">{cls.course?.course_name}</div>
                      <div className="text-xs text-primary font-mono">{cls.course?.course_code}</div>
                  </Td>
                  <Td>
                      {cls.class_name && <Badge variant="primary">{cls.class_name}</Badge>}
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{cls.room?.room_name}</div>
                  </Td>
                  <Td>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{cls.day}</div>
                      {/* Tampilkan start_time & end_time */}
                      <div className="text-xs text-gray-500">{cls.start_time?.substring(0,5)} - {cls.end_time?.substring(0,5)}</div>
                  </Td>
                  <Td className="text-gray-700 dark:text-gray-300">{cls.lecturer?.full_name}</Td>
                  <Td className="text-gray-500 text-sm">{cls.semester?.semester_name}</Td>
                  <Td>
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleOpenEditModal(cls)} className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1.5 transition-colors"><Icon name="edit" className="text-lg" /> Edit</button>
                      <button onClick={() => handleOpenDeleteModal(cls)} className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1.5 transition-colors"><Icon name="delete" className="text-lg" /> Delete</button>
                    </div>
                  </Td>
                </tr>
              )) : <EmptyState message="No class schedules found." colSpan={6} />}
          </Tbody>
        </Table>

        {classes.links.length > 3 && (
            <div className="flex items-center justify-center p-4 gap-1 flex-wrap">
                {classes.links.map((link, key) => (
                    link.url === null ? <div key={key} className="px-3 py-1 text-sm text-gray-400 border rounded-lg" dangerouslySetInnerHTML={{ __html: link.label }} /> :
                    <Button key={key} variant={link.active ? 'primary' : 'ghost'} className={`h-9 px-3 ${link.active ? 'pointer-events-none' : ''}`} onClick={() => router.get(link.url!)}><span dangerouslySetInnerHTML={{ __html: link.label }} /></Button>
                ))}
            </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Create Class Schedule' : 'Edit Schedule'} maxWidth="max-w-2xl" footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={processing}>Cancel</Button><Button onClick={handleSubmit} isLoading={processing}>{modalMode === 'add' ? 'Save Schedule' : 'Update Schedule'}</Button></>}>
          <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label>Course</Label>
                      <Select value={data.course_id} onChange={(e) => setData('course_id', e.target.value)} required>
                          <option value="" disabled>Select Course</option>
                          {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_code} - {c.course_name}</option>)}
                      </Select>
                      {errors.course_id && <p className="text-sm text-red-500">{errors.course_id}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label>Class Name (Optional)</Label>
                      <Input type="text" value={data.class_name} onChange={(e) => setData('class_name', e.target.value)} placeholder="e.g. Class A" />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label>Lecturer</Label>
                      <Select value={data.lecturer_id} onChange={(e) => setData('lecturer_id', e.target.value)} required>
                          <option value="" disabled>Select Lecturer</option>
                          {lecturers.map(l => <option key={l.user_id} value={l.user_id}>{l.full_name}</option>)}
                      </Select>
                      {errors.lecturer_id && <p className="text-sm text-red-500">{errors.lecturer_id}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label>Semester</Label>
                      <Select value={data.semester_id} onChange={(e) => setData('semester_id', e.target.value)} required>
                          <option value="" disabled>Select Semester</option>
                          {semesters.map(s => <option key={s.semester_id} value={s.semester_id}>{s.semester_name} {s.is_active ? '(Active)' : ''}</option>)}
                      </Select>
                      {errors.semester_id && <p className="text-sm text-red-500">{errors.semester_id}</p>}
                  </div>
              </div>

              <div className="space-y-2">
                  <Label>Room</Label>
                  <Select value={data.room_id} onChange={(e) => setData('room_id', e.target.value)} required>
                      <option value="" disabled>Select Room</option>
                      {rooms.map(r => <option key={r.room_id} value={r.room_id}>{r.room_name} ({r.building})</option>)}
                  </Select>
                  {errors.room_id && <p className="text-sm text-red-500">{errors.room_id}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                      <Label>Day</Label>
                      <Select value={data.day} onChange={(e) => setData('day', e.target.value)} required>
                          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label>Start Time</Label>
                      {/* Input start_time */}
                      <Input type="time" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                      <Label>End Time</Label>
                      {/* Input end_time */}
                      <Input type="time" value={data.end_time} onChange={(e) => setData('end_time', e.target.value)} required />
                  </div>
              </div>
          </div>
        </Modal>

        <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} title="Delete Schedule?" message={<>Are you sure you want to delete the schedule for <span className="font-semibold text-gray-900 dark:text-white">{selectedClass?.course?.course_name}</span>?</>} confirmLabel={processing ? "Deleting..." : "Delete"} variant="danger" />
        <FeedbackModal isOpen={feedback.isOpen} onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))} status={feedback.status} title={feedback.title} message={feedback.message} />
      </div>
    </AdminLayout>
  );
};

export default ClassIndex;
