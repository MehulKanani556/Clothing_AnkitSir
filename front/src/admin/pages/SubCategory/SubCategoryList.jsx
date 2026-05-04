import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  fetchCategories,
  fetchMainCategories
} from '../../../redux/slice/category.slice';
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdSearch,
  MdFilterList,
  MdLayers
} from 'react-icons/md';
import SubCategoryForm from './SubCategoryForm';
import Pagination from '../../components/Pagination';

const SubCategoryList = () => {
  const dispatch = useDispatch();
  const { subCategories, loading } = useSelector((state) => state.category);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchSubCategories());
    dispatch(fetchCategories());
    dispatch(fetchMainCategories());
  }, [dispatch]);

  const handleCreate = (values) => {
    const formData = new FormData();
    formData.append('subCategoryName', values.subCategoryName);
    formData.append('categoryId', values.categoryId);
    formData.append('mainCategoryId', values.mainCategoryId);
    if (values.subCategoryImage) {
      formData.append('subCategoryImage', values.subCategoryImage);
    }
    if (values.attributes) {
      formData.append('attributes', JSON.stringify(values.attributes));
    }

    dispatch(createSubCategory(formData)).then((res) => {
      if (!res.error) setIsModalOpen(false);
    });
  };

  const handleUpdate = (values) => {
    const formData = new FormData();
    formData.append('subCategoryName', values.subCategoryName);
    formData.append('categoryId', values.categoryId);
    formData.append('mainCategoryId', values.mainCategoryId);
    if (values.subCategoryImage) {
      formData.append('subCategoryImage', values.subCategoryImage);
    }
    if (values.attributes) {
      formData.append('attributes', JSON.stringify(values.attributes));
    }

    dispatch(updateSubCategory({ id: editingCategory._id, data: formData })).then((res) => {
      if (!res.error) {
        setIsModalOpen(false);
        setEditingCategory(null);
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this sub category?')) {
      dispatch(deleteSubCategory(id));
    }
  };

  const filteredCategories = subCategories.filter(cat =>
    cat.subCategoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sub Categories</h2>
          <p className="text-slate-500 text-sm">Manage your product sub categories here.</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-black/10 active:scale-95"
        >
          <MdAdd size={20} />
          <span>Add New Sub Category</span>
        </button>
      </div>

      {/* Stats and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-4 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center shadow-sm">
          <div className="relative flex-1 w-full">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search sub categories..."
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
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Total Categories</p>
            <p className="text-3xl font-black text-white">{subCategories.length}</p>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <MdLayers className="text-white" size={28} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sub Category Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && subCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading sub categories...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">No sub categories found matching your search.</td>
                </tr>
              ) : (
                paginatedCategories.map((category) => (
                  <tr key={category._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-100 group-hover:border-black/10 transition-colors">
                        {category.subCategoryImage ? (
                          <img
                            src={category.subCategoryImage.startsWith('http') ? category.subCategoryImage : `http://localhost:8000/${category.subCategoryImage}`}
                            alt={category.subCategoryName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + category.subCategoryName }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-300">
                            NO IMG
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                      #{category._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 text-base">{category.subCategoryName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{category.categoryId?.categoryName || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(category.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <MdDelete size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                          <MdMoreVert size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-start p-4 md:p-8 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative z-10 w-full flex justify-center py-4 md:py-10">
            <div className="animate-in zoom-in-95 duration-200 w-full max-w-xl">
              <SubCategoryForm
                initialValues={editingCategory}
                onSubmit={editingCategory ? handleUpdate : handleCreate}
                onCancel={() => {
                  setIsModalOpen(false);
                  setEditingCategory(null);
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

export default SubCategoryList;
