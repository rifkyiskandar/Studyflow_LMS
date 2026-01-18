import React, { useState, useEffect, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import AdminLayout from '@/Layouts/AdminLayout';
import { Semester } from '../../../types';
import Icon from '../../../Components/Icon';
import {
  PageHeader,
  SearchFilterBar,
  Table, Thead, Tbody, Th, Td, EmptyState,
  Button,
  Modal,
  ConfirmationModal,
  FeedbackModal,
  Input, Label, Select, Checkbox, Badge
} from '../../../Components/ReusableUI';

interface IndexProps {
  auth: any;
  semesters: {
    data: Semester[];
    links: any[];
    from: number;
    total: number;
  };
  filters: {
    search?: string;
  };
  flash: {
    success?: string;
    error?: string;
  };
}

const SemesterIndex: React.FC<IndexProps> = ({ auth, semesters, filters, flash = {} }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  const [feedback, setFeedback] = useState<{ isOpen: boolean; status: 'success' | 'error'; title: string; message: string; }>({
    isOpen: false, status: 'success', title: '', message: ''
  });

  useEffect(() => {
    if (flash?.success) setFeedback({ isOpen: true, status: 'success', title: 'Success!', message: flash.success });
    else if (flash?.error) setFeedback({ isOpen: true, status: 'error', title: 'Error!', message: flash.error });
  }, [flash]);


  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    academic_year: '',
    term: 'Ganjil',
    start_date: '',
    end_date: '',
    is_active: false,
  });

  const handleOpenAddModal = () => {
    setModalMode('add');
    reset();
    clearErrors();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (semester: Semester) => {
    setModalMode('edit');
    setData({
        academic_year: semester.academic_year,

        term: semester.term,
        start_date: semester.start_date,
        end_date: semester.end_date,
        is_active: Boolean(semester.is_active),
    });
    clearErrors();
    setSelectedSemester(semester);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (semester: Semester) => {
    setSelectedSemester(semester);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      post(route('admin.semesters.store'), { onSuccess: () => { setIsModalOpen(false); reset(); }, preserveScroll: true });
    } else if (selectedSemester) {
      put(route('admin.semesters.update', selectedSemester.semester_id), { onSuccess: () => { setIsModalOpen(false); reset(); }, preserveScroll: true });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedSemester) {
      destroy(route('admin.semesters.destroy', selectedSemester.semester_id), { onSuccess: () => setIsDeleteModalOpen(false), preserveScroll: true });
    }
  };

  const handleSearch = useCallback(
    debounce((query: string) => {
      router.get(route('admin.semesters.index'), { search: query }, { preserveState: true, replace: true });
    }, 500), []
  );

  const onSearchChange = (e: string) => { setSearchQuery(e); handleSearch(e); };

  return (
    <AdminLayout user={auth.user}>
      <Head title="Manage Semesters" />

      <div className="flex flex-col gap-6 animate-fade-in-up relative">
        <PageHeader title="Semesters Management" subtitle="Manage academic terms and active periods." actionLabel="Add Semester" onAction={handleOpenAddModal} />

        <SearchFilterBar searchValue={searchQuery} onSearchChange={onSearchChange} placeholder="Search semester..." />

        <Table>
          <Thead>
              <Th>Name</Th>
              <Th>Academic Year</Th>
              <Th>Term</Th>
              <Th>Duration</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
          </Thead>
          <Tbody>
            {semesters.data.length > 0 ? semesters.data.map((semester) => (
                <tr key={semester.semester_id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50 transition-colors">
                  <Td className="font-medium text-gray-900 dark:text-white">{semester.semester_name}</Td>
                  <Td className="text-gray-600 dark:text-gray-300">{semester.academic_year}</Td>
                  <Td className="text-gray-600 dark:text-gray-300">{semester.term}</Td>
                  <Td className="text-xs text-gray-500">
                      {semester.start_date} <span className="mx-1">→</span> {semester.end_date}
                  </Td>
                  <Td>
                      <Badge variant={semester.is_active ? 'success' : 'gray'}>
                          {semester.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleOpenEditModal(semester)} className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1.5 transition-colors"><Icon name="edit" className="text-lg" /> Edit</button>
                      <button onClick={() => handleOpenDeleteModal(semester)} className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1.5 transition-colors"><Icon name="delete" className="text-lg" /> Delete</button>
                    </div>
                  </Td>
                </tr>
              )) : <EmptyState message="No semesters found." colSpan={6} />}
          </Tbody>
        </Table>

        {/* Pagination */}
        {semesters.links.length > 3 && (
            <div className="flex items-center justify-center p-4 gap-1 flex-wrap">
                {semesters.links.map((link, key) => (
                    link.url === null ? <div key={key} className="px-3 py-1 text-sm text-gray-400 border rounded-lg" dangerouslySetInnerHTML={{ __html: link.label }} /> :
                    <Button key={key} variant={link.active ? 'primary' : 'ghost'} className={`h-9 px-3 ${link.active ? 'pointer-events-none' : ''}`} onClick={() => router.get(link.url!)}><span dangerouslySetInnerHTML={{ __html: link.label }} /></Button>
                ))}
            </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Add New Semester' : 'Edit Semester'} maxWidth="max-w-xl" footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={processing}>Cancel</Button><Button onClick={handleSubmit} isLoading={processing}>{modalMode === 'add' ? 'Save Semester' : 'Update Semester'}</Button></>}>
          <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="academic_year">Academic Year</Label>
                      <Input type="text" id="academic_year" value={data.academic_year} onChange={(e) => setData('academic_year', e.target.value)} placeholder="e.g. 2024/2025" required autoFocus />
                      {errors.academic_year && <p className="text-sm text-red-500">{errors.academic_year}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="term">Term</Label>
                      <Select id="term" value={data.term} onChange={(e) => setData('term', e.target.value)} required>
                          <option value="Ganjil">Ganjil</option>
                          <option value="Genap">Genap</option>
                          <option value="Pendek">Pendek</option>
                      </Select>
                      {errors.term && <p className="text-sm text-red-500">{errors.term}</p>}
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input type="date" id="start_date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} required />
                      {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input type="date" id="end_date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} required />
                      {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
                  </div>
              </div>

              <Checkbox
                id="is_active"
                label="Set as Active Semester"
                checked={data.is_active}
                onChange={(e) => setData('is_active', e.target.checked)}
              />
          </div>
        </Modal>

        <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} title="Delete Semester?" message={<>Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedSemester?.semester_name}</span>?</>} confirmLabel={processing ? "Deleting..." : "Delete"} variant="danger" />
        <FeedbackModal isOpen={feedback.isOpen} onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))} status={feedback.status} title={feedback.title} message={feedback.message} />
      </div>
    </AdminLayout>
  );
};

export default SemesterIndex;
