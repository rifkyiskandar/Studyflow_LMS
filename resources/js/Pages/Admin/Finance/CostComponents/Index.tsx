import React, { useState, useEffect, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import AdminLayout from '@/Layouts/AdminLayout';
import { CostComponent } from '../../../../types';
import Icon from '../../../../Components/Icon';
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
} from '../../../../Components/ReusableUI';

interface IndexProps {
  auth: any;
  components: {
    data: CostComponent[];
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

const CostComponentIndex: React.FC<IndexProps> = ({ auth, components, filters, flash = {} }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedComponent, setSelectedComponent] = useState<CostComponent | null>(null);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  const [feedback, setFeedback] = useState<{ isOpen: boolean; status: 'success' | 'error'; title: string; message: string; }>({
    isOpen: false, status: 'success', title: '', message: ''
  });

  useEffect(() => {
    if (flash?.success) setFeedback({ isOpen: true, status: 'success', title: 'Success!', message: flash.success });
    else if (flash?.error) setFeedback({ isOpen: true, status: 'error', title: 'Error!', message: flash.error });
  }, [flash]);

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    component_code: '',
    component_name: '',
    billing_type: 'PER_SEMESTER',
    amount: 0,
  });

  const handleOpenAddModal = () => {
    setModalMode('add');
    reset();
    clearErrors();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comp: CostComponent) => {
    setModalMode('edit');
    setData({
        component_code: comp.component_code,
        component_name: comp.component_name,

        billing_type: comp.billing_type,
        amount: Number(comp.amount),
    });
    clearErrors();
    setSelectedComponent(comp);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (comp: CostComponent) => {
    setSelectedComponent(comp);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      post(route('admin.cost_components.store'), { onSuccess: () => { setIsModalOpen(false); reset(); }, preserveScroll: true });
    } else if (selectedComponent) {
      put(route('admin.cost_components.update', selectedComponent.cost_component_id), { onSuccess: () => { setIsModalOpen(false); reset(); }, preserveScroll: true });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedComponent) {
      destroy(route('admin.cost_components.destroy', selectedComponent.cost_component_id), { onSuccess: () => setIsDeleteModalOpen(false), preserveScroll: true });
    }
  };

  const handleSearch = useCallback(
    debounce((query: string) => {
      router.get(route('admin.cost_components.index'), { search: query }, { preserveState: true, replace: true });
    }, 500), []
  );
  const onSearchChange = (e: string) => { setSearchQuery(e); handleSearch(e); };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const getBillingBadge = (type: string) => {
      switch(type) {
          case 'PER_SKS': return 'info';
          case 'PER_SEMESTER': return 'primary';
          case 'ONE_TIME': return 'warning';
          default: return 'gray';
      }
  };

  return (
    <AdminLayout user={auth.user}>
      <Head title="Cost Components" />

      <div className="flex flex-col gap-6 animate-fade-in-up relative">
        <PageHeader title="Cost Components" subtitle="Manage tuition fees and billing items." actionLabel="Add Component" onAction={handleOpenAddModal} />

        <SearchFilterBar searchValue={searchQuery} onSearchChange={onSearchChange} placeholder="Search code or name..." />

        <Table>
          <Thead>
              <Th>Code</Th>
              <Th>Component Name</Th>
              <Th>Billing Type</Th>
              <Th>Default Amount</Th>
              <Th>Actions</Th>
          </Thead>
          <Tbody>
            {components.data.length > 0 ? components.data.map((comp, index) => (
                <tr key={comp.cost_component_id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50 transition-colors">
                  <Td className="font-mono font-bold text-primary">{comp.component_code}</Td>
                  <Td className="font-medium text-gray-900 dark:text-white">{comp.component_name}</Td>
                  <Td>
                      <Badge variant={getBillingBadge(comp.billing_type)}>
                          {comp.billing_type.replace('_', ' ')}
                      </Badge>
                  </Td>
                  <Td className="font-mono text-gray-700 dark:text-gray-300">
                      {formatCurrency(comp.amount)}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleOpenEditModal(comp)} className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1.5 transition-colors"><Icon name="edit" className="text-lg" /> Edit</button>
                      <button onClick={() => handleOpenDeleteModal(comp)} className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1.5 transition-colors"><Icon name="delete" className="text-lg" /> Delete</button>
                    </div>
                  </Td>
                </tr>
              )) : <EmptyState message="No cost components found." colSpan={5} />}
          </Tbody>
        </Table>

        {components.links.length > 3 && (
            <div className="flex items-center justify-center p-4 gap-1 flex-wrap">
                {components.links.map((link, key) => (
                    link.url === null ? <div key={key} className="px-3 py-1 text-sm text-gray-400 border rounded-lg" dangerouslySetInnerHTML={{ __html: link.label }} /> :
                    <Button key={key} variant={link.active ? 'primary' : 'ghost'} className={`h-9 px-3 ${link.active ? 'pointer-events-none' : ''}`} onClick={() => router.get(link.url!)}><span dangerouslySetInnerHTML={{ __html: link.label }} /></Button>
                ))}
            </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Add Cost Component' : 'Edit Component'} maxWidth="max-w-lg" footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={processing}>Cancel</Button><Button onClick={handleSubmit} isLoading={processing}>{modalMode === 'add' ? 'Save Component' : 'Update Component'}</Button></>}>
          <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="component_code">Code</Label>
                  <Input type="text" id="component_code" value={data.component_code} onChange={(e) => setData('component_code', e.target.value)} placeholder="e.g. SPP-001" required autoFocus />
                  {errors.component_code && <p className="text-sm text-red-500">{errors.component_code}</p>}
              </div>
              <div className="space-y-2">
                  <Label htmlFor="component_name">Name</Label>
                  <Input type="text" id="component_name" value={data.component_name} onChange={(e) => setData('component_name', e.target.value)} placeholder="e.g. Sumbangan Pembinaan Pendidikan" required />
                  {errors.component_name && <p className="text-sm text-red-500">{errors.component_name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="billing_type">Billing Type</Label>
                      <Select id="billing_type" value={data.billing_type} onChange={(e) => setData('billing_type', e.target.value)} required>
                          <option value="PER_SEMESTER">Per Semester</option>
                          <option value="PER_SKS">Per SKS</option>
                          <option value="PER_COURSE">Per Mata Kuliah</option>
                          <option value="ONE_TIME">Sekali Bayar (One Time)</option>
                      </Select>
                      {errors.billing_type && <p className="text-sm text-red-500">{errors.billing_type}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="amount">Amount (IDR)</Label>
                      <Input
                        type="number"
                        id="amount"
                        min="0"
                        value={data.amount}
                        onChange={(e) => setData('amount', parseInt(e.target.value) || 0)}
                        required
                      />
                      {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                  </div>
              </div>
          </div>
        </Modal>

        <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} title="Delete Component?" message={<>Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedComponent?.component_name}</span>?</>} confirmLabel={processing ? "Deleting..." : "Delete"} variant="danger" />
        <FeedbackModal isOpen={feedback.isOpen} onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))} status={feedback.status} title={feedback.title} message={feedback.message} />
      </div>
    </AdminLayout>
  );
};

export default CostComponentIndex;
