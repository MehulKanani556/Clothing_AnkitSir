import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    MdDelete, 
    MdEmail, 
    MdPerson, 
    MdSearch, 
    MdRefresh,
    MdWarning,
    MdChat,
    MdCalendarToday,
    MdRemoveRedEye,
    MdFilterList
} from 'react-icons/md';
import { fetchAllContacts, deleteContact } from '../../../redux/slice/contact.slice';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

const ContactList = () => {
    const dispatch = useDispatch();
    const { contacts, loading } = useSelector((state) => state.contact);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
    const [viewMessage, setViewMessage] = useState(null);

    useEffect(() => {
        dispatch(fetchAllContacts());
    }, [dispatch]);

    const handleDelete = async () => {
        try {
            await dispatch(deleteContact(deleteModal.id)).unwrap();
            toast.success('Message deleted successfully');
            setDeleteModal({ show: false, id: null });
        } catch (error) {
            toast.error(error.message || 'Failed to delete message');
        }
    };

    const filteredContacts = (contacts || []).filter(contact => 
        contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-mainText tracking-tight">Customer Messages</h2>
                    <p className="text-lightText text-sm font-medium">View and reply to messages from your customers here.</p>
                </div>
                <button 
                    onClick={() => dispatch(fetchAllContacts())}
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
                            placeholder="Search correspondence..."
                            className="w-full pl-12 pr-4 py-3 bg-mainBG border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm text-mainText font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 text-lightText hover:bg-mainBG hover:text-mainText rounded-none transition-all text-[11px] border border-border font-black uppercase tracking-widest group">
                        <MdFilterList size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                        Filters
                    </button>
                </div>
                <div className="bg-primary p-6 rounded-none border border-primary/10 flex items-center justify-between shadow-xl shadow-primary/20 group overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Incoming</p>
                        <p className="text-3xl font-black text-white leading-tight">{filteredContacts.length}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-none flex items-center justify-center backdrop-blur-md relative z-10 border border-white/10">
                        <MdChat className="text-white" size={28} />
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
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Originator</th>
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Gateway Info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Correspondence Snippet</th>
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em] text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading && contacts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-none animate-spin"></div>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-lightText opacity-50">Syncing Communications...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center font-black uppercase tracking-widest text-xs text-lightText opacity-50">No inquiries found in history.</td>
                                </tr>
                            ) : (
                                currentItems.map((contact) => (
                                    <tr key={contact._id} className="hover:bg-mainBG/30 transition-colors group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-none bg-primary/5 flex items-center justify-center text-primary font-black text-xs border border-primary/10 shadow-sm transition-all duration-500 group-hover:scale-110">
                                                    {contact.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-black text-mainText tracking-tight">{contact.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-mainText tracking-tight">{contact.email}</span>
                                                <span className="text-[10px] text-lightText uppercase font-black tracking-widest opacity-60">Verified Client</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 max-w-xs">
                                            <p className="text-[13px] text-lightText font-medium truncate leading-relaxed">
                                                "{contact.message}"
                                            </p>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-mainText">
                                                    {new Date(contact.createdAt).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-[10px] text-lightText font-bold uppercase tracking-widest">Received</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setViewMessage(contact)}
                                                    className="p-2.5 text-primary hover:bg-primary hover:text-white rounded-none transition-all duration-300 shadow-sm border border-border group-hover:border-primary/20 active:scale-90"
                                                    title="View Details"
                                                >
                                                    <MdRemoveRedEye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteModal({ show: true, id: contact._id })}
                                                    className="p-2.5 text-red-500 hover:bg-red-500 hover:text-white rounded-none transition-all duration-300 shadow-sm border border-border group-hover:border-red-200 active:scale-90"
                                                    title="Purge"
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
                        totalItems={filteredContacts.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* View Modal */}
            {viewMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                    <div className="fixed inset-0 bg-primary/20 backdrop-blur-md z-0" onClick={() => setViewMessage(null)} />
                    <div className="relative z-10 bg-background rounded-none border border-border shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-10 py-8 border-b border-border bg-mainBG/30 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-mainText tracking-tight">Correspondence Protocol</h3>
                                <p className="text-[10px] text-lightText font-black uppercase tracking-widest mt-0.5">Secure Studio Transmission</p>
                            </div>
                            <div className="px-5 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-none border border-primary/20">
                                {new Date(viewMessage.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-6 p-6 bg-mainBG/20 rounded-none border border-border">
                                <div className="w-16 h-16 rounded-none bg-primary text-white flex items-center justify-center text-xl font-black shadow-xl shadow-primary/20">
                                    {viewMessage.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-mainText leading-tight">{viewMessage.name}</h4>
                                    <p className="text-lightText mt-1.5 flex items-center gap-2 text-sm font-medium">
                                        <MdEmail size={16} className="text-primary" />
                                        {viewMessage.email}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-background rounded-none p-8 border border-border relative overflow-hidden group">
                                <MdChat className="absolute -top-6 -right-6 text-primary/5 transition-transform duration-700 group-hover:scale-150" size={120} />
                                <p className="text-mainText text-sm leading-[1.8] font-medium italic relative z-10">
                                    "{viewMessage.message}"
                                </p>
                            </div>
                            <button 
                                onClick={() => setViewMessage(null)}
                                className="w-full py-4 bg-primary text-white rounded-none font-black uppercase tracking-[0.2em] text-[11px] hover:opacity-90 transition-all shadow-2xl shadow-primary/30 active:scale-[0.98]"
                            >
                                Acknowledge Correspondence
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-primary/20 backdrop-blur-md z-0" onClick={() => setDeleteModal({ show: false, id: null })} />
                    <div className="relative z-10 bg-background rounded-none shadow-2xl border border-border w-full max-w-sm p-10 animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-red-500/10 rounded-none flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-500/10 shadow-inner">
                            <MdWarning size={32} />
                        </div>
                        <h3 className="text-lg font-black text-mainText text-center tracking-tight">Purge Transmission?</h3>
                        <p className="text-sm text-lightText text-center mt-2 mb-8 font-medium leading-relaxed">
                            This action will permanently erase this correspondence from the studio archives.
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setDeleteModal({ show: false, id: null })}
                                className="flex-1 py-4 px-4 bg-mainBG text-lightText rounded-none font-black uppercase tracking-widest text-[10px] hover:text-mainText transition-all border border-border active:scale-95"
                            >
                                Abort
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="flex-1 py-4 px-4 bg-red-500 text-white rounded-none font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-xl shadow-red-200 active:scale-95"
                            >
                                Purge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactList;
