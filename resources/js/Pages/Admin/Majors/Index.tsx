import React, { useState, useCallback, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import AdminLayout from '@/Layouts/AdminLayout';
import { Major, Faculty } from '../../../types';
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

interface IndexProps {
  auth: any;
  majors: {
    data: Major[];
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    from: number;
    total: number;
  };
  faculties: Faculty[];
  filters: {
    search?: string;
    faculty_id?: string;
  };
  flash: {
    success?: string;
    error?: string;
  };
}

const MajorIndex: React.FC<IndexProps> = ({ auth, majors, faculties, filters, flash = {} }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [facultyFilter, setFacultyFilter] = useState(filters.faculty_id || '');

  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    status: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    status: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    if (flash?.success) {
      setFeedback({
        isOpen: true,
        status: 'success',
        title: 'Success!',
        message: flash.success
      });
    }
    else if (flash?.error) {
      setFeedback({
        isOpen: true,
        status: 'error',
        title: 'Error!',
        message: flash.error
      });
    }
  }, [flash]);

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    major_name: '',
    faculty_id: '',
  });

  const handleOpenAddModal = () => {
    setModalMode('add');
    reset();
    clearErrors();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (major: Major) => {
    setModalMode('edit');
    setData({
        major_name: major.major_name,
        faculty_id: String(major.faculty_id)
    });
    clearErrors();
    setSelectedMajor(major);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (major: Major) => {
    setSelectedMajor(major);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'add') {
      post(route('admin.majors.store'), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
        preserveScroll: true
      });
    } else if (selectedMajor) {
      put(route('admin.majors.update', selectedMajor.major_id), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
        preserveScroll: true
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedMajor) {
      destroy(route('admin.majors.destroy', selectedMajor.major_id), {
        onSuccess: () => setIsDeleteModalOpen(false),
        preserveScroll: true
      });
    }
  };

  const applyFilters = useCallback(
    debounce((search: string, faculty: string) => {
      router.get(
        route('admin.majors.index'),
        { search, faculty_id: faculty },
        { preserveState: true, replace: true }
      );
    }, 500),
    []
  );

  const onSearchChange = (val: string) => {
    setSearchQuery(val);
    applyFilters(val, facultyFilter);
  };

  const onFacultyFilterChange = (val: string) => {
    setFacultyFilter(val);
    applyFilters(searchQuery, val);
  };

  return (
    <AdminLayout user={auth.user}>
      <Head title="Manage Majors" />

      <div className="flex flex-col gap-6 animate-fade-in-up relative">
        <PageHeader
          title="Majors Management"
          subtitle="Manage the list of majors and their associated faculties."
          actionLabel="Add Major"
          onAction={handleOpenAddModal}
        />

        <SearchFilterBar
          searchValue={searchQuery}
          onSearchChange={onSearchChange}
          placeholder="Search majors..."
        >
            <div className="sm:w-64">
               <Select
                   value={facultyFilter}
                   onChange={(e) => onFacultyFilterChange(e.target.value)}
                   className="bg-gray-50 dark:bg-background-dark h-12"
               >
                 <option value="">All Faculties</option>
                 {faculties.map(faculty => (
                   <option key={faculty.faculty_id} value={faculty.faculty_id}>
                     {faculty.faculty_name}
                   </option>
                 ))}
               </Select>
            </div>
        </SearchFilterBar>

        <Table>
          <Thead>
              <Th>#</Th>
              <Th>Major Name</Th>
              <Th>Faculty</Th>
              <Th>Actions</Th>
          </Thead>
          <Tbody>
            {majors.data.length > 0 ? (
              majors.data.map((major, index) => (
                <tr key={major.major_id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50 transition-colors">
                  <Td className="text-gray-500 text-sm">
                      {majors.from + index}
                  </Td>
                  <Td className="text-gray-900 dark:text-white font-medium">{major.major_name}</Td>
                  <Td>
                      <Badge variant="primary">
                          {major.faculty?.faculty_name || 'No Faculty'}
                      </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleOpenEditModal(major)}
                        className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Icon name="edit" className="text-lg" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(major)}
                        className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Icon name="delete" className="text-lg" />
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))
            ) : (
              <EmptyState message="No majors found matching your criteria." colSpan={4} />
            )}
          </Tbody>
        </Table>

        {majors.links.length > 3 && (
            <div className="flex items-center justify-center p-4 gap-1 flex-wrap">
                {majors.links.map((link, key) => (
                    link.url === null ? (
                        <div key={key} className="px-3 py-1 text-sm text-gray-400 border rounded-lg" dangerouslySetInnerHTML={{ __html: link.label }} />
                    ) : (
                        <Button
                            key={key}
                            variant={link.active ? 'primary' : 'ghost'}
                            className={`h-9 px-3 ${link.active ? 'pointer-events-none' : ''}`}
                            onClick={() => router.get(link.url!)}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </Button>
                    )
                ))}
            </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'add' ? 'Add New Major' : 'Edit Major'}
          footer={
              <>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={processing}>Cancel</Button>
                  <Button onClick={handleSubmit} isLoading={processing}>
                      {modalMode === 'add' ? 'Save Major' : 'Update Major'}
                  </Button>
              </>
          }
        >
          <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="major_name">Major Name</Label>
                  <Input
                    type="text"
                    id="major_name"
                    value={data.major_name}
                    onChange={(e) => setData('major_name', e.target.value)}
                    placeholder="e.g. Computer Science"
                    autoFocus
                    required
                  />
                  {errors.major_name && <p className="text-sm text-red-500">{errors.major_name}</p>}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="faculty_id">Faculty</Label>
                  <Select
                      id="faculty_id"
                      value={data.faculty_id}
                      onChange={(e) => setData('faculty_id', e.target.value)}
                      required
                  >
                      <option value="" disabled>Select a Faculty</option>
                      {faculties.map(faculty => (
                          <option key={faculty.faculty_id} value={faculty.faculty_id}>
                              {faculty.faculty_name}
                          </option>
                      ))}
                  </Select>
                  {errors.faculty_id && <p className="text-sm text-red-500">{errors.faculty_id}</p>}
              </div>
          </div>
        </Modal>

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Major?"
          message={<>Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedMajor?.major_name}</span>?</>}
          confirmLabel={processing ? "Deleting..." : "Delete"}
          variant="danger"
        />

        <FeedbackModal
            isOpen={feedback.isOpen}
            onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
            status={feedback.status}
            title={feedback.title}
            message={feedback.message}
        />
      </div>
    </AdminLayout>
  );
};

export default MajorIndex;
