import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { MdClose, MdSave, MdCloudUpload, MdDelete, MdAdd, MdLayers } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useSelector } from 'react-redux';

const CategoryForm = ({ initialValues, onSubmit, onCancel, isLoading }) => {
  const [preview, setPreview] = useState(null);
  const [attributes, setAttributes] = useState(initialValues?.attributes || []);
  const { mainCategories } = useSelector((state) => state.category);

  useEffect(() => {
    if (initialValues?.categoryImage) {
      setPreview(initialValues.categoryImage.startsWith('http') ? initialValues.categoryImage : `http://localhost:8000/${initialValues.categoryImage}`);
    } else {
      setPreview(null);
    }
  }, [initialValues]);

  const formik = useFormik({
    initialValues: {
      categoryName: initialValues?.categoryName || '',
      mainCategoryId: initialValues?.mainCategoryId?._id || initialValues?.mainCategoryId || '',
      categoryImage: null
    },
    validationSchema: Yup.object({
      categoryName: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Category name is required'),
      mainCategoryId: Yup.string().required('Main category is required'),
      categoryImage: Yup.mixed().nullable()
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit({ ...values, attributes });
    },
  });

  const handleImageChange = (e) => {
    const file = e.currentTarget.files[0];
    if (file) {
      formik.setFieldValue('categoryImage', file);
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
            {initialValues ? 'Edit Category' : 'Add New Category'}
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
                        formik.setFieldValue('categoryImage', null);
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
                id="categoryImage"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-2">
            <label htmlFor="categoryName" className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">
              Categorization Name
            </label>
            <input
              id="categoryName"
              name="categoryName"
              type="text"
              placeholder="e.g. Premium Collections"
              className={`w-full px-6 py-4 rounded-none border transition-all outline-none text-sm font-black tracking-tight ${formik.touched.categoryName && formik.errors.categoryName
                ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                : 'border-border focus:border-primary focus:ring-8 focus:ring-primary/5 bg-mainBG/10'
                }`}
              {...formik.getFieldProps('categoryName')}
            />
            {formik.touched.categoryName && formik.errors.categoryName && (
              <p className="text-[10px] font-black text-red-500 ml-1 uppercase tracking-widest mt-1">{formik.errors.categoryName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="mainCategoryId" className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">
              Master Hierarchy
            </label>
            <select
              id="mainCategoryId"
              name="mainCategoryId"
              className={`w-full px-6 py-4 rounded-none border transition-all outline-none text-sm font-black tracking-tight appearance-none bg-mainBG/10 ${formik.touched.mainCategoryId && formik.errors.mainCategoryId
                ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                : 'border-border focus:border-primary focus:ring-8 focus:ring-primary/5'
                }`}
              {...formik.getFieldProps('mainCategoryId')}
            >
              <option value="" className="font-black">Select Master Tier</option>
              {mainCategories.map((mainCat) => (
                <option key={mainCat._id} value={mainCat._id} className="font-black">
                  {mainCat.mainCategoryName}
                </option>
              ))}
            </select>
            {formik.touched.mainCategoryId && formik.errors.mainCategoryId && (
              <p className="text-[10px] font-black text-red-500 ml-1 uppercase tracking-widest mt-1">{formik.errors.mainCategoryId}</p>
            )}
          </div>
        </div>

        {/* Attributes Section */}
        <div className="space-y-5 pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-[11px] font-black text-mainText uppercase tracking-widest opacity-70">Descriptor Attributes</label>
              <p className="text-[10px] text-lightText font-bold uppercase tracking-tight mt-1">Define size, material, or variants</p>
            </div>
            <button
              type="button"
              onClick={() => setAttributes([...attributes, { name: '', type: 'size', values: [], isRequired: false }])}
              className="flex items-center gap-2 text-[10px] font-black text-primary hover:bg-primary/5 px-4 py-2.5 rounded-none border border-primary/20 transition-all uppercase tracking-widest active:scale-95"
            >
              <MdAdd size={16} />
              Add Attribute
            </button>
          </div>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
            {attributes.map((attr, index) => (
              <div key={index} className="p-6 bg-mainBG/30 rounded-none space-y-4 border border-border/50 group hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Parameter {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => setAttributes(attributes.filter((_, i) => i !== index))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-none transition-colors active:scale-90"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-mainText uppercase tracking-widest ml-1">Key Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Material"
                      className="w-full px-4 py-3 rounded-none border border-border mt-1 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-black tracking-tight bg-white"
                      value={attr.name}
                      onChange={(e) => {
                        const newAttrs = [...attributes];
                        newAttrs[index].name = e.target.value;
                        setAttributes(newAttrs);
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-mainText uppercase tracking-widest ml-1">Logic Type</label>
                    <select
                      className="w-full px-4 py-3 rounded-none border border-border mt-1 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-black tracking-tight bg-white"
                      value={attr.type}
                      onChange={(e) => {
                        const newAttrs = [...attributes];
                        newAttrs[index].type = e.target.value;
                        setAttributes(newAttrs);
                      }}
                    >
                      <option value="size" className="font-black">Size</option>
                      <option value="color" className="font-black">Color</option>
                      <option value="material" className="font-black">Material</option>
                      <option value="style" className="font-black">Style</option>
                      <option value="other" className="font-black">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-mainText uppercase tracking-widest ml-1">Values (comma delimited)</label>
                  <input
                    type="text"
                    placeholder="e.g. S, M, L, XL"
                    className="w-full px-4 py-3 rounded-none border border-border mt-1 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-black tracking-tight bg-white"
                    value={attr.values.join(', ')}
                    onChange={(e) => {
                      const newAttrs = [...attributes];
                      newAttrs[index].values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                      setAttributes(newAttrs);
                    }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-none border-border text-primary focus:ring-primary/20 transition-all cursor-pointer"
                      checked={attr.isRequired}
                      onChange={(e) => {
                        const newAttrs = [...attributes];
                        newAttrs[index].isRequired = e.target.checked;
                        setAttributes(newAttrs);
                      }}
                    />
                  </div>
                  <label className="text-[10px] font-black text-mainText uppercase tracking-widest cursor-pointer">Enforce Selection</label>
                </div>
              </div>
            ))}

            {attributes.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-border rounded-none bg-mainBG/10 group hover:bg-mainBG/20 transition-all">
                <MdLayers size={32} className="mx-auto mb-3 text-lightText opacity-20 group-hover:scale-110 transition-transform duration-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-lightText opacity-50">No attributes defined for this category</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-8 py-4 border border-border text-lightText font-black uppercase tracking-widest text-[11px] rounded-none hover:bg-mainBG hover:text-mainText transition-all active:scale-95"
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
