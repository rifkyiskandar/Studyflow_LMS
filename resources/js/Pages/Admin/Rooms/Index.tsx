import React, { useState, useCallback, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import AdminLayout from '@/Layouts/AdminLayout';
import { Room } from '../../../types';
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
  rooms: {
    data: Room[];
    links: any[];
    from: number;
    total: number;
  };
  existingBuildings: string[];
  existingFloors: string[];
  filters: {
    search?: string;
    building?: string;
  };
  flash: {
    success?: string;
    error?: string;
  };
}

const RoomIndex: React.FC<IndexProps> = ({ auth, rooms, existingBuildings, existingFloors, filters, flash = {} }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [buildingSelectMode, setBuildingSelectMode] = useState<string>('');
  const [floorSelectMode, setFloorSelectMode] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [buildingFilter, setBuildingFilter] = useState(filters.building || '');

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
    if (flash?.success) setFeedback({ isOpen: true, status: 'success', title: 'Success!', message: flash.success });
    else if (flash?.error) setFeedback({ isOpen: true, status: 'error', title: 'Error!', message: flash.error });
  }, [flash]);

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    room_name: '',
    building: '',
    floor: '',
    capacity: 30,
  });

  const handleBuildingSelectChange = (val: string) => {
    setBuildingSelectMode(val);
    setData('building', val === 'new' ? '' : val);
  };

  const handleFloorSelectChange = (val: string) => {
    setFloorSelectMode(val);
    setData('floor', val === 'new' ? '' : val);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    reset();
    clearErrors();

    setBuildingSelectMode(existingBuildings.length > 0 ? existingBuildings[0] : 'new');
    setData('building', existingBuildings.length > 0 ? existingBuildings[0] : '');

    setFloorSelectMode(existingFloors.length > 0 ? existingFloors[0] : 'new');
    setData('floor', existingFloors.length > 0 ? existingFloors[0] : '');

    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room: Room) => {
    setModalMode('edit');

    const isBuildingExist = existingBuildings.includes(room.building);
    const isFloorExist = existingFloors.includes(room.floor);

    setBuildingSelectMode(isBuildingExist ? room.building : 'new');
    setFloorSelectMode(isFloorExist ? room.floor : 'new');

    setData({
        room_name: room.room_name,
        building: room.building,
        floor: room.floor,
        capacity: room.capacity
    });

    clearErrors();
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      post(route('admin.rooms.store'), {
        onSuccess: () => { setIsModalOpen(false); reset(); },
        preserveScroll: true
      });
    } else if (selectedRoom) {
      put(route('admin.rooms.update', selectedRoom.room_id), {
        onSuccess: () => { setIsModalOpen(false); reset(); },
        preserveScroll: true
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedRoom) {
      destroy(route('admin.rooms.destroy', selectedRoom.room_id), {
        onSuccess: () => setIsDeleteModalOpen(false),
        preserveScroll: true
      });
    }
  };

  const applyFilters = useCallback(
    debounce((search: string, build: string) => {
      router.get(route('admin.rooms.index'), { search, building: build }, { preserveState: true, replace: true });
    }, 500), []
  );

  const onSearchChange = (val: string) => { setSearchQuery(val); applyFilters(val, buildingFilter); };
  const onBuildingFilterChange = (val: string) => { setBuildingFilter(val); applyFilters(searchQuery, val); };

  return (
    <AdminLayout user={auth.user}>
      <Head title="Manage Rooms" />

      <div className="flex flex-col gap-6 animate-fade-in-up relative">
        <PageHeader title="Rooms Management" subtitle="Manage classrooms, labs, and capacities." actionLabel="Add Room" onAction={handleOpenAddModal} />

        <SearchFilterBar searchValue={searchQuery} onSearchChange={onSearchChange} placeholder="Search room or building...">
            <div className="sm:w-64">
               <Select value={buildingFilter} onChange={(e) => onBuildingFilterChange(e.target.value)} className="bg-gray-50 dark:bg-background-dark h-12">
                 <option value="">All Buildings</option>
                 {existingBuildings.map(b => <option key={b} value={b}>{b}</option>)}
               </Select>
            </div>
        </SearchFilterBar>

        <Table>
          <Thead>
              <Th>Building</Th>
              <Th>Floor</Th>
              <Th>Room Name</Th>
              <Th>Capacity</Th>
              <Th>Actions</Th>
          </Thead>
          <Tbody>
            {rooms.data.length > 0 ? rooms.data.map((room, index) => (
                <tr key={room.room_id} className="hover:bg-gray-50 dark:hover:bg-background-dark/50 transition-colors">
                  <Td className="text-gray-900 dark:text-white font-medium">{room.building}</Td>
                  <Td className="text-gray-500">{room.floor}</Td>
                  <Td className="font-bold text-gray-700 dark:text-gray-200">{room.room_name}</Td>
                  <Td><Badge variant="info"><Icon name="group" className="text-sm mr-1" />{room.capacity}</Badge></Td>
                  <Td>
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleOpenEditModal(room)} className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1.5 transition-colors"><Icon name="edit" className="text-lg" /> Edit</button>
                      <button onClick={() => handleOpenDeleteModal(room)} className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1.5 transition-colors"><Icon name="delete" className="text-lg" /> Delete</button>
                    </div>
                  </Td>
                </tr>
              )) : <EmptyState message="No rooms found." colSpan={5} />}
          </Tbody>
        </Table>

        {rooms.links.length > 3 && (
            <div className="flex items-center justify-center p-4 gap-1 flex-wrap">
                {rooms.links.map((link, key) => (
                    link.url === null ? (
                        <div key={key} className="px-3 py-1 text-sm text-gray-400 border rounded-lg" dangerouslySetInnerHTML={{ __html: link.label }} />
                    ) : (
                        <Button key={key} variant={link.active ? 'primary' : 'ghost'} className={`h-9 px-3 ${link.active ? 'pointer-events-none' : ''}`} onClick={() => router.get(link.url!)}>
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </Button>
                    )
                ))}
            </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Add New Room' : 'Edit Room'} maxWidth="max-w-xl" footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={processing}>Cancel</Button><Button onClick={handleSubmit} isLoading={processing}>{modalMode === 'add' ? 'Save Room' : 'Update Room'}</Button></>}>
          <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label>Building</Label>
                      <Select value={buildingSelectMode} onChange={(e) => handleBuildingSelectChange(e.target.value)}>
                          {existingBuildings.map(b => <option key={b} value={b}>{b}</option>)}
                          <option value="new">+ Add New Building...</option>
                      </Select>
                      {buildingSelectMode === 'new' && <Input type="text" value={data.building} onChange={(e) => setData('building', e.target.value)} placeholder="Enter building name" className="animate-fade-in" required />}
                      {errors.building && <p className="text-sm text-red-500">{errors.building}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label>Floor</Label>
                      <Select value={floorSelectMode} onChange={(e) => handleFloorSelectChange(e.target.value)}>
                          {existingFloors.map(f => <option key={f} value={f}>{f}</option>)}
                          <option value="new">+ Add New Floor...</option>
                      </Select>
                      {floorSelectMode === 'new' && <Input type="text" value={data.floor} onChange={(e) => setData('floor', e.target.value)} placeholder="Enter floor (e.g. 1, G)" className="animate-fade-in" required />}
                      {errors.floor && <p className="text-sm text-red-500">{errors.floor}</p>}
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label htmlFor="room_name">Room Name/Number</Label>
                      <Input type="text" id="room_name" value={data.room_name} onChange={(e) => setData('room_name', e.target.value)} placeholder="e.g. 101, Lab A" required />
                      {errors.room_name && <p className="text-sm text-red-500">{errors.room_name}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input type="number" id="capacity" min="1" value={data.capacity} onChange={(e) => setData('capacity', parseInt(e.target.value) || 0)} required />
                      {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
                  </div>
              </div>
          </div>
        </Modal>

        <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} title="Delete Room?" message={<>Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedRoom?.room_name}</span>?</>} confirmLabel={processing ? "Deleting..." : "Delete"} variant="danger" />
        <FeedbackModal isOpen={feedback.isOpen} onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))} status={feedback.status} title={feedback.title} message={feedback.message} />
      </div>
    </AdminLayout>
  );
};

export default RoomIndex;
