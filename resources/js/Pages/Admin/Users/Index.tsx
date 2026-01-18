import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import AdminLayout from '@/Layouts/AdminLayout';
import { User, Faculty, Major, Semester } from '../../../types';
import Icon from '../../../Components/Icon';
import {
  PageHeader,
  SearchFilterBar,
  Table, Thead, Tbody, Th, Td, EmptyState,
  Badge,
  Button,
  Modal,
  ConfirmationModal,
  FeedbackModal,
  Input, Label, Select, Pagination
} from '../../../Components/ReusableUI';
import useTranslation from '../../../Hooks/useTranslation';

interface IndexProps {
  auth: any;
  users: {
    data: User[];
    links: any[];
    from: number;
    total: number;
  };
  faculties: Faculty[];
  majors: Major[];
  semesters: Semester[];
  filters: {
    search?: string;
    role?: string;
  };
  flash: {
    success?: string;
    error?: string;
  };
}

const UserIndex: React.FC<IndexProps> = ({ auth, users, faculties, majors, semesters, filters, flash = {} }) => {
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [addStep, setAddStep] = useState<'role_selection' | 'form'>('role_selection');

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [roleFilter, setRoleFilter] = useState(filters.role || '3');

  const [feedback, setFeedback] = useState<{ isOpen: boolean; status: 'success' | 'error'; title: string; message: string; }>({
    isOpen: false, status: 'success', title: '', message: ''
  });

  useEffect(() => {
    if (flash?.success) setFeedback({ isOpen: true, status: 'success', title: 'Success!', message: flash.success });
    else if (flash?.error) setFeedback({ isOpen: true, status: 'error', title: 'Error!', message: flash.error });
  }, [flash]);

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: 3,
    phone_number: '',
    birth_date: '',
    profile_picture: null as File | null,

    faculty_id: '',
    major_id: '',
    semester_id: '',
    batch_year: new Date().getFullYear().toString(),

    title: '',
    position: '',
  });

  const availableMajors = useMemo(() => {
    if (!data.faculty_id) return [];
    return majors.filter(m => String(m.faculty_id) === String(data.faculty_id));
  }, [data.faculty_id, majors]);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setAddStep('role_selection');
    reset();
    clearErrors();
    setPreviewImage(null);
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleSelectRole = (roleId: number) => {
      setData('role_id', roleId);
      setAddStep('form');
  };

  const handleOpenEditModal = (user: User) => {
    setModalMode('edit');
    setAddStep('form');

    setPreviewImage(null);

    let formData = {
        full_name: user.full_name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role_id: user.role_id,
        phone_number: user.phone_number || '',
        birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
        profile_picture: null,

        faculty_id: '',
        major_id: '',
        semester_id: '',
        batch_year: '',
        title: '',
        position: '',
    };

    if (user.role_id === 3 && user.student_profile) {
        formData.faculty_id = String(user.student_profile.faculty_id);
        formData.major_id = String(user.student_profile.major_id);
        formData.semester_id = String(user.student_profile.semester_id);
        formData.batch_year = String(user.student_profile.batch_year);
    } else if (user.role_id === 2 && user.lecturer_profile) {
        formData.faculty_id = String(user.lecturer_profile.faculty_id);
        formData.title = user.lecturer_profile.title || '';
        formData.position = user.lecturer_profile.position || '';
    }


    setData(formData);
    clearErrors();
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setData('profile_picture', file);
          const reader = new FileReader();
          reader.onloadend = () => {
              setPreviewImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      post(route('admin.users.store'), {
          onSuccess: () => { setIsModalOpen(false); reset(); },
          preserveScroll: true,
          forceFormData: true
      });
    } else if (selectedUser) {
        router.post(route('admin.users.update', selectedUser.user_id), {
            _method: 'put',
            ...data,
        }, {
            onSuccess: () => { setIsModalOpen(false); reset(); },
            preserveScroll: true,
            forceFormData: true
        });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      destroy(route('admin.users.destroy', selectedUser.user_id), { onSuccess: () => setIsDeleteModalOpen(false), preserveScroll: true });
    }
  };

  const applyFilters = useCallback(
    debounce((search: string, role: string) => {
      router.get(route('admin.users.index'), { search, role }, { preserveState: true, replace: true });
    }, 500), []
  );

  const onSearchChange = (val: string) => { setSearchQuery(val); applyFilters(val, roleFilter); };
  const onRoleFilterChange = (val: string) => { setRoleFilter(val); applyFilters(searchQuery, val); };

  const getRoleName = (id: number) => {
      if (id === 1) return 'Admin';
      if (id === 2) return 'Lecturer';
      return 'Student';
  };

  const getRoleDisplayName = (id: number) => {
      if (id === 1) return t('Administrator');
      if (id === 2) return t('Lecturer');
      return t('Student');
  };

  const getRoleBadgeVariant = (id: number) => {
      if (id === 1) return 'error';
      if (id === 2) return 'warning';
      return 'info';
  };

  const renderRoleSelection = () => (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-2">
          <div onClick={() => handleSelectRole(3)} className="cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:border-primary bg-white dark:bg-gray-800 p-6 rounded-xl flex flex-col items-center gap-4 transition-all hover:shadow-lg group">
              <div className="size-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <Icon name="school" className="text-4xl" />
              </div>
              <div className="text-center"><h3 className="font-bold text-gray-900 dark:text-white">{t('Student')}</h3><p className="text-sm text-gray-500">{t('Active Students')}</p></div>
          </div>
          <div onClick={() => handleSelectRole(2)} className="cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-500 bg-white dark:bg-gray-800 p-6 rounded-xl flex flex-col items-center gap-4 transition-all hover:shadow-lg group">
              <div className="size-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform">
                  <Icon name="cast_for_education" className="text-4xl" />
              </div>
              <div className="text-center"><h3 className="font-bold text-gray-900 dark:text-white">{t('Lecturer')}</h3><p className="text-sm text-gray-500">{t('Faculty Members')}</p></div>
          </div>
          <div onClick={() => handleSelectRole(1)} className="cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 bg-white dark:bg-gray-800 p-6 rounded-xl flex flex-col items-center gap-4 transition-all hover:shadow-lg group">
              <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                  <Icon name="admin_panel_settings" className="text-4xl" />
              </div>
              <div className="text-center"><h3 className="font-bold text-gray-900 dark:text-white">{t('Administrator')}</h3><p className="text-sm text-gray-500">{t('System Access')}</p></div>
          </div>
      </div>
  );

  const renderFormContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <Icon name="account_circle" className="text-gray-500" /> {t('Account Info')}
            </h4>

            <div className="flex items-center gap-4 pb-2">
                <div
                    className="size-20 rounded-full bg-gray-100 dark:bg-gray-700 bg-cover bg-center border border-gray-200 dark:border-gray-600 flex-shrink-0"
                    style={{
                        backgroundImage: previewImage
                            ? `url(${previewImage})`
                            : selectedUser?.profile_picture
                                ? `url(${selectedUser.profile_picture})`
                                : 'none'
                    }}
                >
                    {!previewImage && !selectedUser?.profile_picture && (
                        <Icon name="person" className="text-4xl text-gray-400 dark:text-gray-500 m-auto h-full flex items-center justify-center" />
                    )}
                </div>
                <div className="flex flex-col gap-2">
                     <Button
                        type="button"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs py-1 px-3"
                    >
                        {t('Upload Picture')}
                     </Button>
                     <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                     />
                     <span className="text-xs text-gray-500">{t('Max 2MB. JPG, PNG.')}</span>
                     {errors.profile_picture && <span className="text-xs text-red-500">{errors.profile_picture}</span>}
                </div>
            </div>

            <div className="space-y-2">
                <Label>{t('Full Name')}</Label>
                <Input type="text" value={data.full_name} onChange={e => setData('full_name', e.target.value)} required placeholder="John Doe" />
                {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
                <Label>{t('Email')}</Label>
                <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required placeholder="user@lms.com" />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {modalMode === 'add' && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{t('Password')}</Label>
                        <Input type="password" value={data.password} onChange={e => setData('password', e.target.value)} required />
                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('Confirm')}</Label>
                        <Input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>{t('Phone Number')}</Label>
                    <Input type="text" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} placeholder="08..." />
                </div>
                <div className="space-y-2">
                    <Label>{t('Birth Date')}</Label>
                    <Input
                        type="date"
                        value={data.birth_date}
                        onChange={e => setData('birth_date', e.target.value)}
                    />
                    {errors.birth_date && <p className="text-sm text-red-500">{errors.birth_date}</p>}
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <Icon name="badge" className="text-gray-500" /> {getRoleDisplayName(data.role_id)} {t('Profile')}
            </h4>

            {data.role_id === 3 && (
                <>
                    <div className="space-y-2">
                        <Label>{t('Faculty')}</Label>
                        <Select value={data.faculty_id} onChange={e => setData('faculty_id', e.target.value)} required>
                            <option value="" disabled>{t('Select Faculty')}</option>
                            {faculties.map(f => <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_name}</option>)}
                        </Select>
                        {errors.faculty_id && <p className="text-sm text-red-500">{errors.faculty_id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('Major')}</Label>
                        <Select value={data.major_id} onChange={e => setData('major_id', e.target.value)} required disabled={!data.faculty_id}>
                            <option value="" disabled>{t('Select Major')}</option>
                            {availableMajors.map(m => <option key={m.major_id} value={m.major_id}>{m.major_name}</option>)}
                        </Select>
                        {errors.major_id && <p className="text-sm text-red-500">{errors.major_id}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('Semester')}</Label>
                            <Select value={data.semester_id} onChange={e => setData('semester_id', e.target.value)} required>
                                <option value="" disabled>{t('Select')}</option>
                                {semesters.map(s => <option key={s.semester_id} value={s.semester_id}>{s.semester_name}</option>)}
                            </Select>
                            {errors.semester_id && <p className="text-sm text-red-500">{errors.semester_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>{t('Batch Year')}</Label>
                            <Input type="number" value={data.batch_year} onChange={e => setData('batch_year', e.target.value)} required />
                            {errors.batch_year && <p className="text-sm text-red-500">{errors.batch_year}</p>}
                        </div>
                    </div>
                </>
            )}

            {data.role_id === 2 && (
                <>
                    <div className="space-y-2">
                        <Label>{t('Faculty')}</Label>
                        <Select value={data.faculty_id} onChange={e => setData('faculty_id', e.target.value)} required>
                            <option value="" disabled>{t('Select Faculty')}</option>
                            {faculties.map(f => <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_name}</option>)}
                        </Select>
                        {errors.faculty_id && <p className="text-sm text-red-500">{errors.faculty_id}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('Academic Title')}</Label>
                        <Input type="text" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="e.g. M.Sc., Ph.D." />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('Position')}</Label>
                        <Input type="text" value={data.position} onChange={e => setData('position', e.target.value)} placeholder="e.g. Senior Lecturer" />
                    </div>
                </>
            )}

            {data.role_id === 1 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded text-center text-sm text-gray-500">
                    {t('Administrator accounts have full access and do not require specific academic profiles.')}
                </div>
            )}
        </div>
    </div>
  );

  return (
    <AdminLayout user={auth.user}>
      <Head title={t('User Management')} />

      <div className="flex flex-col gap-6 animate-fade-in-up relative">
        <PageHeader title={t('User Management')} subtitle={t('Manage students, lecturers, and admin accounts.')} actionLabel={t('Add User')} actionIcon="person_add" onAction={handleOpenAddModal} />

        <SearchFilterBar searchValue={searchQuery} onSearchChange={onSearchChange} placeholder={t('Search by name or email...')}>
            <div className="sm:w-56">
               <Select value={roleFilter} onChange={(e) => onRoleFilterChange(e.target.value)} className="bg-gray-50 dark:bg-background-dark h-12">
                 <option value="3">{t('Students')}</option>
                 <option value="2">{t('Lecturers')}</option>
                 <option value="1">{t('Admins')}</option>
               </Select>
            </div>
        </SearchFilterBar>

        <Table>
          <Thead>
              <Th>{t('User')}</Th>
              <Th>{t('Role')}</Th>
              <Th>{t('ID (NIM/NIDN)')}</Th>
              <Th>{t('Affiliation')}</Th>
              <Th>{t('Actions')}</Th>
          </Thead>
          <Tbody>
            {users.data.length > 0 ? users.data.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50 transition-colors">
                  <Td>
                      <div className="flex items-center gap-3">
                          <div
                              className="size-9 rounded-full bg-gray-100 dark:bg-gray-700 bg-cover bg-center border border-gray-200 dark:border-gray-600 flex items-center justify-center text-primary font-bold text-sm"
                              style={user.profile_picture ? { backgroundImage: `url(${user.profile_picture})` } : {}}
                          >
                              {!user.profile_picture && user.full_name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                              <span className="text-gray-900 dark:text-white font-medium">{user.full_name}</span>
                              <span className="text-gray-500 text-xs">{user.email}</span>
                          </div>
                      </div>
                  </Td>
                  <Td><Badge variant={getRoleBadgeVariant(user.role_id)}>{getRoleDisplayName(user.role_id)}</Badge></Td>
                  <Td className="text-gray-600 dark:text-gray-300 font-mono text-sm">
                      {user.role_id === 3 ? user.student_profile?.student_number :
                       user.role_id === 2 ? user.lecturer_profile?.lecturer_number : '-'}
                  </Td>
                  <Td className="text-gray-600 dark:text-gray-300 text-sm">
                      {user.role_id === 3 ? user.student_profile?.major?.major_name :
                       user.role_id === 2 ? user.lecturer_profile?.faculty?.faculty_name : 'System Admin'}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleOpenEditModal(user)} className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1.5 transition-colors"><Icon name="edit" className="text-lg" /> {t('Edit')}</button>
                      <button onClick={() => handleOpenDeleteModal(user)} className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1.5 transition-colors"><Icon name="delete" className="text-lg" /> {t('Delete')}</button>
                    </div>
                  </Td>
                </tr>
              )) : <EmptyState message={t('No users found.')} colSpan={5} />}
          </Tbody>
        </Table>

        {users.links.length > 3 && (
            <div className="flex items-center justify-center p-4 gap-1 flex-wrap">
                {users.links.map((link, key) => (
                    link.url === null ? <div key={key} className="px-3 py-1 text-sm text-gray-400 border rounded-lg" dangerouslySetInnerHTML={{ __html: link.label }} /> :
                    <Button key={key} variant={link.active ? 'primary' : 'ghost'} className={`h-9 px-3 ${link.active ? 'pointer-events-none' : ''}`} onClick={() => router.get(link.url)}><span dangerouslySetInnerHTML={{ __html: link.label }} /></Button>
                ))}
            </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' && addStep === 'role_selection' ? t('Select User Type') : `${modalMode === 'add' ? t('Add') : t('Edit')} ${getRoleDisplayName(data.role_id)}`} maxWidth={addStep === 'form' ? "max-w-4xl" : "max-w-3xl"} footer={addStep === 'role_selection' ? (<Button variant="secondary" onClick={() => setIsModalOpen(false)}>{t('Cancel')}</Button>) : (<>{modalMode === 'add' && <Button variant="secondary" onClick={() => setAddStep('role_selection')}>{t('Back')}</Button>}{modalMode === 'edit' && <Button variant="secondary" onClick={() => setIsModalOpen(false)}>{t('Cancel')}</Button>}<Button onClick={handleSubmit} isLoading={processing}>{modalMode === 'add' ? t('Create User') : t('Update User')}</Button></>)}>
            {addStep === 'role_selection' ? renderRoleSelection() : renderFormContent()}
        </Modal>

        <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} title={t('Delete User?')} message={<>{t('Are you sure you want to delete')} <span className="font-semibold text-gray-900 dark:text-white">{selectedUser?.full_name}</span>?</>} confirmLabel={processing ? "Deleting..." : t('Delete')} variant="danger" />
        <FeedbackModal isOpen={feedback.isOpen} onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))} status={feedback.status} title={feedback.title} message={feedback.message} />
      </div>
    </AdminLayout>
  );
};

export default UserIndex;
