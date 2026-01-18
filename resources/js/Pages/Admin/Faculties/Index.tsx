import React, { useState, useEffect, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import AdminLayout from '@/Layouts/AdminLayout';
import { Faculty } from '../../../types';
import Icon from '../../../Components/Icon';
import {
  PageHeader,
  SearchFilterBar,
  Table, Thead, Tbody, Th, Td, EmptyState,
  Button,
  Modal,
  ConfirmationModal,
  Input, Label, Badge
} from '../../../Components/ReusableUI';

interface IndexProps {
  auth: any;
  faculties: {
    data: Faculty[];
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  filters: {
    search?: string;
  };
}

const FacultyIndex: React.FC<IndexProps> = ({ auth, faculties, filters }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    faculty_name: '',
  });

  const handleOpenAddModal = () => {
    setModalMode('add');
    reset();
    clearErrors();
    setSelectedFaculty(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faculty: Faculty) => {
    setModalMode('edit');
    setData('faculty_name', faculty.faculty_name);
    clearErrors();
    setSelectedFaculty(faculty);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'add') {
      post(route('admin.faculties.store'), {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        },
        preserveScroll: true
      });
    } else {
      if (selectedFaculty) {
        put(route('admin.faculties.update', selectedFaculty.faculty_id), {
          onSuccess: () => {
            setIsModalOpen(false);
            reset();
          },
          preserveScroll: true
        });
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedFaculty) {
      destroy(route('admin.faculties.destroy', selectedFaculty.faculty_id), {
        onSuccess: () => setIsDeleteModalOpen(false),
        preserveScroll: true
      });
    }
  };

  const handleSearch = useCallback(
    debounce((query: string) => {
      router.get(
        route('admin.faculties.index'),
        { search: query },
        { preserveState: true, replace: true }
      );
    }, 500),
    []
  );

  const onSearchChange = (value: string) => {
    setSearchQuery(value);
    handleSearch(value);
  };

  return (
    <AdminLayout user={auth.user}>
      <Head title="Manage Faculties" />

      <div className="flex flex-col gap-6 animate-fade-in-up relative">
        <PageHeader
          title="Faculties Management"
          subtitle="Manage the list of faculties for the university."
          actionLabel="Add Faculty"
          onAction={handleOpenAddModal}
        />

        <SearchFilterBar
          searchValue={searchQuery}
          onSearchChange={onSearchChange}
          placeholder="Search faculties..."
        />

        <Table>
          <Thead>
            <Th>#</Th>
            <Th>Faculty Name</Th>
            <Th>Actions</Th>
          </Thead>
          <Tbody>
            {faculties.data.length > 0 ? (
              faculties.data.map((faculty, index) => (
                <tr key={faculty.faculty_id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50 transition-colors">
                   <Td className="text-gray-500 text-sm">
                      {faculties.from + index}
                   </Td>
                  <Td className="text-gray-900 dark:text-white font-medium">
                    {faculty.faculty_name}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleOpenEditModal(faculty)}
                        className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Icon name="edit" className="text-lg" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(faculty)}
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
              <EmptyState message="No faculties found." colSpan={3} />
            )}
          </Tbody>
        </Table>

        {faculties.links.length > 3 && (
            <div className="flex items-center justify-center p-4 gap-1 flex-wrap">
                {faculties.links.map((link, key) => (
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
          title={modalMode === 'add' ? 'Add New Faculty' : 'Edit Faculty'}
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={processing}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={processing}>
                {modalMode === 'add' ? 'Save Faculty' : 'Update Faculty'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="faculty_name">Faculty Name</Label>
              <Input
                type="text"
                id="faculty_name"
                value={data.faculty_name}
                onChange={(e) => setData('faculty_name', e.target.value)}
                placeholder="e.g. Faculty of Law"
                autoFocus
                required
              />
              {errors.faculty_name && (
                <p className="text-sm text-red-500 mt-1">{errors.faculty_name}</p>
              )}
            </div>
          </div>
        </Modal>

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Faculty?"
          message={
            <>Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedFaculty?.faculty_name}</span>? This action cannot be undone.</>
          }
          confirmLabel={processing ? "Deleting..." : "Delete"}
          variant="danger"
        />
      </div>
    </AdminLayout>
  );
};

export default FacultyIndex;
