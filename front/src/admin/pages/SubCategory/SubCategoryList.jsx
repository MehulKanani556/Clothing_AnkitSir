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
  MdLayers,
  MdRefresh
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
          <h2 className="text-2xl font-black text-mainText tracking-tight">Product Sub-Categories</h2>
          <p className="text-lightText text-sm font-medium">View and manage your store sub-categories here.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => dispatch(fetchCategories())}
            className="flex items-center gap-2.5 bg-white text-mainText px-6 py-2.5 rounded-none font-bold hover:shadow-lg hover:shadow-black/5 transition-all border border-slate-200 active:scale-95 shadow-sm"
          >
            <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
            <span className="text-[14px]">Refresh List</span>
          </button>
          <button
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-none font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95 uppercase text-xs tracking-widest"
          >
            <MdAdd size={20} />
            <span>New Sub Category</span>
          </button>
        </div>
      </div>

      {/* Stats and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-background p-4 rounded-none border border-border flex flex-col md:flex-row gap-4 items-center shadow-sm">
          <div className="relative flex-1 w-full">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lightText" size={18} />
            <input
              type="text"
              placeholder="Search by sub category name..."
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
            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Total Records</p>
            <p className="text-3xl font-black text-white leading-tight">{subCategories.length}</p>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-none flex items-center justify-center backdrop-blur-sm border border-white/10">
            <MdLayers className="text-white" size={28} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-background rounded-none border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-mainBG/50 border-b border-border">
                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Visual</th>
                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Ref ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Category Title</th>
                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Parent Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Registered</th>
                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em] text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && subCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-16 text-center text-lightText italic">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-none animate-spin"></div>
                      <span className="text-[11px] font-black uppercase tracking-widest opacity-50">Syncing database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-16 text-center text-lightText font-bold text-sm italic">No sub categories found matching your search.</td>
                </tr>
              ) : (
                paginatedCategories.map((category) => (
                  <tr key={category._id} className="hover:bg-mainBG/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="w-14 h-14 rounded-none bg-mainBG overflow-hidden border border-border group-hover:border-primary/20 transition-all duration-500 shadow-sm group-hover:shadow-md">
                        {category.subCategoryImage ? (
                          <img
                            src={category.subCategoryImage.startsWith('http') ? category.subCategoryImage : `http://localhost:8000/${category.subCategoryImage}`}
                            alt={category.subCategoryName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + category.subCategoryName }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-lightText/30 uppercase tracking-tighter">
                            NO-IMG
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[11px] text-lightText font-black font-mono tracking-tighter">
                      #{category._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-black text-mainText text-sm tracking-tight">{category.subCategoryName}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[11px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-none border border-primary/10">
                        {category.categoryId?.categoryName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[11px] font-black text-lightText uppercase tracking-tighter">
                      {new Date(category.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setIsModalOpen(true);
                          }}
                          className="p-2.5 text-primary hover:bg-primary hover:text-white rounded-none transition-all duration-300 shadow-sm border border-border group-hover:border-primary/20"
                          title="Edit Category"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2.5 text-red-500 hover:bg-red-500 hover:text-white rounded-none transition-all duration-300 shadow-sm border border-border group-hover:border-red-200"
                          title="Delete Category"
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
          <div className="fixed inset-0 bg-primary/20 backdrop-blur-md z-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative z-10 w-full flex justify-center py-4 md:py-10">
            <div className="animate-in zoom-in-95 duration-300 w-full max-w-xl">
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
