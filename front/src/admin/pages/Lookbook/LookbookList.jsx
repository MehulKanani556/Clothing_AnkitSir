import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchLookbooksAdmin, 
  deleteLookbook 
} from '../../../redux/slice/lookbook.slice';
import { 
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdFilterList,
  MdLayers,
  MdImage
} from 'react-icons/md';
import LookbookForm from './LookbookForm';
import Pagination from '../../components/Pagination';

const LookbookList = () => {
  const dispatch = useDispatch();
  const { adminLookbooks, loading } = useSelector((state) => state.lookbook);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLookbook, setEditingLookbook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchLookbooksAdmin());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this lookbook?')) {
      dispatch(deleteLookbook(id));
    }
  };

  const filteredLookbooks = (adminLookbooks || []).filter(lb => 
    lb.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredLookbooks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLookbooks = filteredLookbooks.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Lookbooks</h2>
          <p className="text-slate-500 text-sm">Manage your curated fashion lookbooks here.</p>
        </div>
        <button 
          onClick={() => {
            setEditingLookbook(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-black/10 active:scale-95"
        >
          <MdAdd size={20} />
          <span>Create New Look</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-4 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center shadow-sm">
            <div className="relative flex-1 w-full">
                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search lookbooks..."
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 text-slate-600 hover:bg-black hover:text-white rounded-2xl transition-all text-sm border border-slate-100 font-semibold group">
                <MdFilterList size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>Filters</span>
            </button>
        </div>
        <div className="bg-black p-5 rounded-3xl border border-black flex items-center justify-between shadow-xl shadow-black/10">
            <div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Total Looks</p>
                <p className="text-3xl font-black text-white">{(adminLookbooks || []).length}</p>
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <MdLayers className="text-white" size={28} />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Main Image</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (adminLookbooks || []).length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading lookbooks...</span>
                        </div>
                    </td>
                </tr>
              ) : filteredLookbooks.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No lookbooks found.</td>
                </tr>
              ) : (
                paginatedLookbooks.map((lb) => (
                  <tr key={lb._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-100 group-hover:border-black/10 transition-colors">
                        {lb.lookImage ? (
                          <img 
                            src={lb.lookImage} 
                            alt={lb.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-300">
                            <MdImage size={24} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 text-base">{lb.title}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {lb.products?.length || 0} Products
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${lb.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {lb.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => {
                                setEditingLookbook(lb);
                                setIsModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(lb._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-start p-4 md:p-8 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative z-10 w-full flex justify-center py-4 md:py-10">
            <div className="animate-in zoom-in-95 duration-200 w-full max-w-2xl">
              <LookbookForm 
                initialValues={editingLookbook}
                onCancel={() => {
                  setIsModalOpen(false);
                  setEditingLookbook(null);
                }}
                isLoading={loading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LookbookList;
