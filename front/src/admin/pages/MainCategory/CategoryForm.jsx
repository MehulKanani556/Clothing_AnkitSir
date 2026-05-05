import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { MdClose, MdSave, MdCloudUpload, MdDelete } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const CategoryForm = ({ initialValues, onSubmit, onCancel, isLoading }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (initialValues?.mainCategoryImage) {
      setPreview(initialValues.mainCategoryImage.startsWith('http') ? initialValues.mainCategoryImage : `http://localhost:8000/${initialValues.mainCategoryImage}`);
    } else {
      setPreview(null);
    }
  }, [initialValues]);

  const formik = useFormik({
    initialValues: {
      mainCategoryName: initialValues?.mainCategoryName || '',
      mainCategoryImage: null
    },
    validationSchema: Yup.object({
      mainCategoryName: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Category name is required'),
      mainCategoryImage: Yup.mixed().nullable()
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const handleImageChange = (e) => {
    const file = e.currentTarget.files[0];
    if (file) {
      formik.setFieldValue('mainCategoryImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-background rounded-none shadow-2xl border border-border overflow-hidden max-w-xl w-full mx-auto">
      <div className="px-10 py-6 border-b border-border flex justify-between items-center bg-mainBG/30">
        <div>
          <h3 className="font-black text-mainText text-xl tracking-tight">
            {initialValues ? 'Edit Main Category' : 'Add New Main Category'}
          </h3>
          <p className="text-[10px] text-lightText font-black uppercase tracking-widest mt-0.5">Category Details</p>
        </div>
        <button 
          onClick={onCancel}
          className="p-3 hover:bg-white rounded-none text-lightText hover:text-primary transition-all border border-border hover:border-primary/20 hover:shadow-sm active:scale-95"
        >
          <MdClose size={20} />
        </button>
      </div>

      <form onSubmit={formik.handleSubmit} className="p-10 space-y-8">
        {/* Image Upload Section */}
        <div className="space-y-3">
          <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Category Image</label>
          <div className="relative group">
            <div className={`w-full h-64 rounded-none border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center overflow-hidden bg-mainBG/20 ${preview ? 'border-primary' : 'border-border hover:border-primary'}`}>
              {preview ? (
                <div className="relative w-full h-full group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
                    <button 
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        formik.setFieldValue('mainCategoryImage', null);
                      }}
                      className="bg-white text-red-500 p-4 rounded-none shadow-2xl hover:scale-110 transition-transform active:scale-90"
                    >
                      <MdDelete size={24} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="w-16 h-16 bg-white rounded-none flex items-center justify-center shadow-sm border border-border group-hover:scale-110 transition-transform duration-500">
                    <MdCloudUpload size={28} className="text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-mainText tracking-tight">Add Category Image</p>
                    <p className="text-[10px] text-lightText font-black uppercase tracking-[0.1em] mt-1.5">Click to upload image</p>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                id="mainCategoryImage"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-2">
            <label htmlFor="mainCategoryName" className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">
              Category Name
            </label>
            <input
              id="mainCategoryName"
              name="mainCategoryName"
              type="text"
              placeholder="e.g. Summer Essentials"
              className={`w-full px-6 py-4 rounded-none border transition-all outline-none text-sm font-black tracking-tight ${
                formik.touched.mainCategoryName && formik.errors.mainCategoryName
                  ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                  : 'border-border focus:border-primary focus:ring-8 focus:ring-primary/5 bg-mainBG/10'
              }`}
              {...formik.getFieldProps('mainCategoryName')}
            />
            {formik.touched.mainCategoryName && formik.errors.mainCategoryName && (
              <p className="text-[10px] font-black text-red-500 ml-1 uppercase tracking-widest mt-1">{formik.errors.mainCategoryName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-8 py-4 border border-border text-lightText font-black uppercase tracking-widest text-[11px] rounded-none hover:bg-mainBG transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formik.isValid}
            className="flex-[2] px-8 py-4 bg-primary hover:opacity-90 disabled:opacity-30 text-white font-black uppercase tracking-[0.15em] text-[11px] rounded-none shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            {isLoading ? (
              <AiOutlineLoading3Quarters size={20} className="animate-spin" />
            ) : (
              <MdSave size={20} />
            )}
            {initialValues ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
