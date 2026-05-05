import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    MdDelete, 
    MdEmail, 
    MdPerson, 
    MdSearch, 
    MdRefresh,
    MdWarning,
    MdSupport,
    MdCalendarToday,
    MdRemoveRedEye,
    MdLabel
} from 'react-icons/md';
import { fetchAllSupport, deleteSupport } from '../../../redux/slice/contact.slice';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

const SupportList = () => {
    const dispatch = useDispatch();
    const { support, loading } = useSelector((state) => state.contact);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
    const [viewTicket, setViewTicket] = useState(null);

    useEffect(() => {
        dispatch(fetchAllSupport());
    }, [dispatch]);

    const handleDelete = async () => {
        try {
            await dispatch(deleteSupport(deleteModal.id)).unwrap();
            toast.success('Support ticket deleted successfully');
            setDeleteModal({ show: false, id: null });
        } catch (error) {
            toast.error(error.message || 'Failed to delete support ticket');
        }
    };

    const filteredSupport = (support || []).filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSupport.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSupport.length / itemsPerPage);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-mainText tracking-tight">Help & Support</h2>
                    <p className="text-lightText text-sm font-medium">View and solve customer support problems here.</p>
                </div>
                <button 
                    onClick={() => dispatch(fetchAllSupport())}
                    className="flex items-center justify-center gap-2.5 bg-white text-mainText px-6 py-2.5 rounded-none font-bold hover:shadow-lg hover:shadow-black/5 transition-all border border-slate-200 active:scale-95 shadow-sm"
                >
                    <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
                    <span className="text-[14px]">Refresh List</span>
                </button>
            </div>

            {/* Stats and Search */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-background p-4 rounded-none border border-border flex flex-col md:flex-row gap-4 items-center shadow-sm">
                    <div className="relative flex-1 w-full">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lightText" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name, email, subject or content..."
                            className="w-full pl-12 pr-4 py-3 bg-mainBG border border-border rounded-none outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm text-mainText font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="bg-primary p-6 rounded-none border border-primary/10 flex items-center justify-between shadow-xl shadow-primary/20 group overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Active Tickets</p>
                        <p className="text-3xl font-black text-white leading-tight">{filteredSupport.length}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-none flex items-center justify-center backdrop-blur-md relative z-10 border border-white/10">
                        <MdSupport className="text-white" size={28} />
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-none -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-background rounded-none border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-mainBG/50 border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Requester</th>
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Subject</th>
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Inquiry Preview</th>
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Received</th>
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em] text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading && support.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-none animate-spin"></div>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-lightText opacity-50">Syncing database...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSupport.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <MdSupport size={64} className="mx-auto mb-4 opacity-10" />
                                        <p className="text-[11px] font-black uppercase tracking-widest text-lightText opacity-50">No support tickets found</p>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((item) => (
                                    <tr key={item._id} className="hover:bg-mainBG/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-none bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black text-sm group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                                                    {item.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-mainText text-sm tracking-tight">{item.name}</span>
                                                    <span className="text-[10px] text-lightText font-bold">{item.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-none text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                                {item.subject}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 max-w-xs">
                                            <p className="text-sm text-lightText font-medium truncate italic opacity-80">"{item.message}"</p>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-mainText">
                                                    {new Date(item.createdAt).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-[10px] text-lightText font-bold uppercase tracking-widest">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setViewTicket(item)}
                                                    className="p-2.5 text-primary hover:bg-primary hover:text-white rounded-none transition-all duration-300 shadow-sm border border-border group-hover:border-primary/20"
                                                    title="View Detail"
                                                >
                                                    <MdRemoveRedEye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteModal({ show: true, id: item._id })}
                                                    className="p-2.5 text-red-500 hover:bg-red-500 hover:text-white rounded-none transition-all duration-300 shadow-sm border border-border group-hover:border-red-200"
                                                    title="Remove"
                                                >
                                                    <MdDelete size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {totalPages > 1 && (
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredSupport.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* View Modal */}
            {viewTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-primary/20 backdrop-blur-md z-0" onClick={() => setViewTicket(null)} />
                    <div className="relative z-10 bg-background rounded-none border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-border bg-mainBG/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 rounded-none">
                                    <MdSupport className="text-primary" size={24} />
                                </div>
                                <h3 className="text-xl font-black text-mainText tracking-tight">Support Case</h3>
                            </div>
                            <div className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-none border border-amber-100 shadow-sm">
                                {viewTicket.subject}
                            </div>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-none bg-primary text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-primary/20">
                                        {viewTicket.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-mainText leading-none tracking-tight">{viewTicket.name}</h4>
                                        <p className="text-lightText mt-1.5 text-sm font-medium">{viewTicket.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-lightText uppercase tracking-[0.2em] mb-1">Incoming</p>
                                    <p className="text-sm font-black text-mainText">{new Date(viewTicket.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="bg-mainBG rounded-none p-8 border border-border relative overflow-hidden group">
                                <MdLabel className="absolute -bottom-6 -right-6 text-primary/5 group-hover:scale-110 transition-transform duration-700" size={120} />
                                <p className="text-mainText text-lg leading-relaxed font-medium italic relative z-10">
                                    "{viewTicket.message}"
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <a 
                                    href={`mailto:${viewTicket.email}`}
                                    className="flex-1 py-4 bg-primary text-white rounded-none font-black uppercase tracking-[0.15em] text-[11px] hover:opacity-90 transition-all shadow-xl shadow-primary/20 text-center flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <MdEmail size={20} />
                                    Compose Reply
                                </a>
                                <button 
                                    onClick={() => setViewTicket(null)}
                                    className="px-8 py-4 bg-mainBG text-lightText rounded-none font-black uppercase tracking-[0.15em] text-[11px] hover:text-mainText transition-all border border-border active:scale-95"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-primary/20 backdrop-blur-md z-0" onClick={() => setDeleteModal({ show: false, id: null })} />
                    <div className="relative z-10 bg-background rounded-none shadow-2xl border border-border w-full max-w-sm p-8 animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-red-50 rounded-none flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-100">
                            <MdWarning size={32} />
                        </div>
                        <h3 className="text-xl font-black text-mainText text-center tracking-tight">Remove Ticket?</h3>
                        <p className="text-sm text-lightText text-center mt-2 mb-8 font-medium leading-relaxed">
                            This will permanently remove this support inquiry. This action is irreversible.
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setDeleteModal({ show: false, id: null })}
                                className="flex-1 py-3.5 bg-mainBG text-lightText rounded-none font-black uppercase tracking-widest text-[11px] hover:text-mainText transition-colors border border-border active:scale-95"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="flex-1 py-3.5 bg-red-500 text-white rounded-none font-black uppercase tracking-widest text-[11px] hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 active:scale-95"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportList;
