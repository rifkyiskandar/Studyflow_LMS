import React, { useState, useMemo, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { PageHeader, Card, Badge, Button, Checkbox, ConfirmationModal, FeedbackModal } from '../../../Components/ReusableUI';
import { Billing } from '../../../types';
import StatsCard from '../../Admin/StatsCard';
import Icon from '../../../Components/Icon';
import axios from 'axios';
import useTranslation from '../../../Hooks/useTranslation';

interface PaymentRecord {
    payment_id: number;
    order_id: string;
    total_amount: number;
    status: string;
    created_at: string;
}

interface BillingProps {
    auth: any;
    billings: Billing[];
    paymentHistory: PaymentRecord[];
    totalPaid: number;
}

const BillingIndex: React.FC<BillingProps> = ({ auth, billings, paymentHistory, totalPaid }) => {
    const { t } = useTranslation();
    const { env } = usePage<any>().props;

    const [activeTab, setActiveTab] = useState<'bills' | 'history'>('bills');
    const [selectedBills, setSelectedBills] = useState<number[]>([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [feedback, setFeedback] = useState<{isOpen: boolean, status: 'success' | 'error', title: string, message: string}>({
        isOpen: false, status: 'success', title: '', message: ''
    });

    useEffect(() => {
        const scriptId = 'midtrans-snap-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.src = env?.midtrans_is_production
                ? 'https://app.midtrans.com/snap/snap.js'
                : 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.id = scriptId;
            script.setAttribute('data-client-key', env?.midtrans_client_key || '');
            document.body.appendChild(script);
        }
    }, [env]);

    const unpaidBills = useMemo(() => billings.filter(b => b.status === 'unpaid' || b.status === 'overdue'), [billings]);

    const totalSelectedAmount = useMemo(() => {
        return unpaidBills
          .filter(b => selectedBills.includes(b.billing_id))
          .reduce((sum, b) => sum + Number(b.amount), 0);
    }, [unpaidBills, selectedBills]);

    const totalUnpaidAmount = unpaidBills.reduce((sum, b) => sum + Number(b.amount), 0);

    const formatIDR = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid': case 'settlement': case 'capture': return 'success';
            case 'pending': return 'warning';
            case 'deny': case 'expire': case 'cancel': case 'overdue': return 'error';
            default: return 'gray';
        }
    };

    const toggleBillSelection = (id: number) => {
        setSelectedBills(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedBills.length === unpaidBills.length) setSelectedBills([]);
        else setSelectedBills(unpaidBills.map(b => b.billing_id));
    };

    const handlePay = async () => {
        setIsConfirmOpen(false);
        try {
            const response = await axios.post(route('student.payment.create'), {
                billing_ids: selectedBills
            });
            const token = response.data.snap_token;


            window.snap.pay(token, {
                onSuccess: function(result: any) {
                    setFeedback({ isOpen: true, status: 'success', title: t('Payment Successful!'), message: t('Your payment has been received and verified.') });
                    setTimeout(() => window.location.reload(), 2000);
                },
                onPending: function(result: any) {
                    setFeedback({ isOpen: true, status: 'success', title: t('Waiting for Payment'), message: t('Please complete the payment process.') });
                    setTimeout(() => window.location.reload(), 2000);
                },
                onError: function(result: any) {
                    setFeedback({ isOpen: true, status: 'error', title: t('Payment Failed'), message: t('An error occurred during the transaction.') });
                },
                onClose: function() {
                }
            });
        } catch (error) {
            console.error(error);
            setFeedback({ isOpen: true, status: 'error', title: t('Error!'), message: t('Failed to initialize payment transaction.') });
        }
    };

    return (
        <StudentLayout user={auth.user}>
            <Head title={t('Finance & Payment')} />

            <div className="flex flex-col gap-6 animate-fade-in-up relative pb-24">
                <PageHeader title={t('Finance & Payment')} subtitle={t('Manage your tuition bills and payment history.')} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatsCard
                        title={t('Total Unpaid Bills')}
                        value={formatIDR(totalUnpaidAmount)}
                        trend={`${unpaidBills.length} ${t('Active Bills')}`}
                        trendType={unpaidBills.length > 0 ? 'negative' : 'neutral'}
                        icon="receipt_long"
                        color="warning"
                    />
                    <StatsCard
                        title={t('Total Paid')}
                        value={formatIDR(totalPaid)}
                        trend={t('Accumulated Successful Payments')}
                        trendType="positive"
                        icon="history"
                        color="success"
                    />
                </div>

                <div className="flex border-b border-gray-200 dark:border-gray-800 mt-2">
                    <button onClick={() => setActiveTab('bills')} className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'bills' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>{t('Active Bills')} ({unpaidBills.length})</button>
                    <button onClick={() => setActiveTab('history')} className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>{t('Payment History')}</button>
                </div>

                {activeTab === 'bills' ? (
                    <div className="flex flex-col gap-4">
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-background-dark border-b border-gray-200 dark:border-gray-800">
                                        <tr>
                                            <th className="px-6 py-4 w-12">
                                                <Checkbox checked={unpaidBills.length > 0 && selectedBills.length === unpaidBills.length} onChange={toggleSelectAll} disabled={unpaidBills.length === 0} />
                                            </th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('Bill Description')}</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('Due Date')}</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('Status')}</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{t('Amount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {unpaidBills.length > 0 ? unpaidBills.map(bill => (
                                            <tr key={bill.billing_id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selectedBills.includes(bill.billing_id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <Checkbox checked={selectedBills.includes(bill.billing_id)} onChange={() => toggleBillSelection(bill.billing_id)} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{bill.description}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{bill.cost_component?.component_name} • {bill.semester?.semester_name}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                    {new Date(bill.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4"><Badge variant={getStatusVariant(bill.status)} className="uppercase text-[10px]">{bill.status}</Badge></td>
                                                <td className="px-6 py-4 text-right font-mono font-medium text-gray-900 dark:text-white">{formatIDR(Number(bill.amount))}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={5} className="p-12 text-center text-gray-400 italic">{t('No active bills found.')}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-background-dark border-b border-gray-200 dark:border-gray-800">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('Order ID')}</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('Date')}</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('Status')}</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{t('Amount')}</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{t('Action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                         {paymentHistory.length > 0 ? paymentHistory.map(pay => (
                                             <tr key={pay.payment_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                 <td className="px-6 py-4 text-sm font-mono text-gray-500">{pay.order_id}</td>
                                                 <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                     {formatDate(pay.created_at)}
                                                 </td>
                                                 <td className="px-6 py-4">
                                                     <Badge variant={getStatusVariant(pay.status)} className="uppercase text-[10px]">
                                                         {pay.status}
                                                     </Badge>
                                                 </td>
                                                 <td className="px-6 py-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                                                     {formatIDR(Number(pay.total_amount))}
                                                 </td>
                                                 <td className="px-6 py-4 text-right">
                                                     {pay.status === 'pending' && (
                                                         <button
                                                            className="text-xs text-primary hover:underline font-semibold"
                                                            onClick={() => alert('Feature to resume payment can be implemented here using snap_token')}
                                                         >
                                                             {t('Pay Now')}
                                                         </button>
                                                     )}
                                                 </td>
                                             </tr>
                                         )) : (
                                             <tr><td colSpan={5} className="p-12 text-center text-gray-400 italic">{t('No payment history found.')}</td></tr>
                                         )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'bills' && selectedBills.length > 0 && (
                    <div className="fixed bottom-6 left-0 right-0 sm:left-64 px-6 animate-fade-in-up z-40">
                        <div className="max-w-4xl mx-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-4 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-700 dark:border-gray-200">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center">
                                    <Icon name="receipt_long" className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">{selectedBills.length} {t('Bills Selected')}</p>
                                    <p className="text-2xl font-bold font-mono">{formatIDR(totalSelectedAmount)}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <Button variant="secondary" onClick={() => setSelectedBills([])} className="flex-1 sm:flex-none border-0 bg-white/10 text-white hover:bg-white/20 dark:bg-black/5 dark:text-gray-800 dark:hover:bg-black/10">{t('Cancel')}</Button>
                                <Button onClick={() => setIsConfirmOpen(true)} className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white border-0 shadow-lg shadow-primary/30">{t('Pay Now')} <Icon name="arrow_forward" /></Button>
                            </div>
                        </div>
                    </div>
                )}

                <ConfirmationModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={handlePay}
                    title={t('Confirm Payment')}
                    message={<>You are about to pay for <b>{selectedBills.length} bills</b> with a total of <b className="text-lg text-primary">{formatIDR(totalSelectedAmount)}</b>. Proceed?</>}
                    confirmLabel={t('Proceed to Pay')}
                />


                <FeedbackModal
                    isOpen={feedback.isOpen}
                    onClose={() => setFeedback({...feedback, isOpen: false})}
                    status={feedback.status}
                    title={feedback.title}
                    message={feedback.message}
                />
            </div>
        </StudentLayout>
    );
}

export default BillingIndex;
