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
  MdImage,
  MdRefresh
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-mainText tracking-tight">Store Lookbooks</h2>
          <p className="text-lightText text-sm font-medium">Create and manage lookbooks for your store collections here.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => dispatch(fetchLookbooksAdmin())}
            className="flex items-center gap-2.5 bg-white text-mainText px-6 py-2.5 rounded-none font-bold hover:shadow-lg hover:shadow-black/5 transition-all border border-slate-200 active:scale-95 shadow-sm"
          >
            <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
            <span className="text-[14px]">Refresh List</span>
          </button>
          <button
            onClick={() => {
              setEditingLookbook(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-none font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95 uppercase text-xs tracking-widest"
          >
            <MdAdd size={20} />
            <span>Create New Look</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-background p-4 rounded-none border border-border flex flex-col md:flex-row gap-4 items-center shadow-sm">
          <div className="relative flex-1 w-full">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lightText" size={18} />
            <input
              type="text"
              placeholder="Search lookbooks by title..."
              className="w-full pl-12 pr-4 py-3 bg-mainBG border border-border rounded-none outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm text-mainText font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 text-lightText hover:bg-mainBG hover:text-mainText rounded-none transition-all text-[11px] border border-border font-black uppercase tracking-widest group">
            <MdFilterList size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            <span>Filters</span>
          </button>
        </div>
        <div className="bg-primary p-5 rounded-none border border-primary flex items-center justify-between shadow-xl shadow-primary/10">
          <div>
            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Total Looks</p>
            <p className="text-3xl font-black text-white leading-tight">{(adminLookbooks || []).length}</p>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-none flex items-center justify-center backdrop-blur-sm border border-white/10">
            <MdLayers className="text-white" size={28} />
          </div>
        </div>
      </div>

      <div className="bg-background rounded-none border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-mainBG/50 border-b border-border">
                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Visual</th>
                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Lookbook Title</th>
                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Linked Items</th>
                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em] text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && (adminLookbooks || []).length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center text-lightText italic">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-none animate-spin"></div>
                      <span className="text-[11px] font-black uppercase tracking-widest opacity-50">Fetching looks...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLookbooks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center text-lightText font-bold text-sm italic">No lookbooks found.</td>
                </tr>
              ) : (
                paginatedLookbooks.map((lb) => (
                  <tr key={lb._id} className="hover:bg-mainBG/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="w-20 h-20 rounded-none bg-mainBG overflow-hidden border border-border group-hover:border-primary/20 transition-all duration-500 shadow-sm group-hover:shadow-md">
                        {lb.lookImage ? (
                          <img
                            src={lb.lookImage}
                            alt={lb.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lightText/30 uppercase tracking-tighter">
                            <MdImage size={32} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-black text-mainText text-sm tracking-tight leading-tight block max-w-xs">{lb.title}</span>
                      <span className="text-[10px] text-lightText font-bold uppercase tracking-widest mt-1 block">ID: {lb._id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[11px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-none border border-primary/10">
                        {lb.products?.length || 0} Products
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-[0.2em] border ${lb.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        <div className={`w-1.5 h-1.5 rounded-none ${lb.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                        {lb.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingLookbook(lb);
                            setIsModalOpen(true);
                          }}
                          className="p-2.5 text-primary hover:bg-primary hover:text-white rounded-none transition-all duration-300 shadow-sm border border-border group-hover:border-primary/20"
                          title="Edit Lookbook"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(lb._id)}
                          className="p-2.5 text-red-500 hover:bg-red-500 hover:text-white rounded-none transition-all duration-300 shadow-sm border border-border group-hover:border-red-200"
                          title="Delete Lookbook"
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
          <div className="fixed inset-0 bg-primary/20 backdrop-blur-md z-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative z-10 w-full flex justify-center py-4 md:py-10">
            <div className="animate-in zoom-in-95 duration-300 w-full max-w-2xl">
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
