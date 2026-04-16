import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { MdClose, MdSave, MdCloudUpload, MdDelete, MdAdd } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useSelector } from 'react-redux';

const InsideSubCategoryForm = ({ initialValues, onSubmit, onCancel, isLoading }) => {
  const [preview, setPreview] = useState(null);
  const [attributes, setAttributes] = useState(initialValues?.attributes || []);
  const { subCategories } = useSelector((state) => state.category);

  useEffect(() => {
    if (initialValues?.insideSubCategoryImage) {
      setPreview(initialValues.insideSubCategoryImage.startsWith('http') ? initialValues.insideSubCategoryImage : `http://localhost:8000/${initialValues.insideSubCategoryImage}`);
    } else {
      setPreview(null);
    }
  }, [initialValues]);

  const formik = useFormik({
    initialValues: {
      insideSubCategoryName: initialValues?.insideSubCategoryName || '',
      subCategoryId: initialValues?.subCategoryId?._id || initialValues?.subCategoryId || '',
      insideSubCategoryImage: null
    },
    validationSchema: Yup.object({
      insideSubCategoryName: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Inside sub category name is required'),
      subCategoryId: Yup.string().required('Sub category is required'),
      insideSubCategoryImage: Yup.mixed().nullable()
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit({ ...values, attributes });
    },
  });

  const handleImageChange = (e) => {
    const file = e.currentTarget.files[0];
    if (file) {
      formik.setFieldValue('insideSubCategoryImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-w-xl w-full mx-auto">
      <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="font-black text-slate-900 text-xl tracking-tight">
            {initialValues ? 'Edit Inside Sub Category' : 'Create New Inside Sub Category'}
          </h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Admin Studio</p>
        </div>
        <button
          onClick={onCancel}
          className="p-2.5 hover:bg-white rounded-2xl text-slate-400 hover:text-black transition-all border border-transparent hover:border-slate-200 hover:shadow-sm"
        >
          <MdClose size={20} />
        </button>
      </div>

      <form onSubmit={formik.handleSubmit} className="p-8 space-y-6">
        {/* Image Upload Section */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Category Image</label>
          <div className="relative group">
            <div className={`w-full h-56 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-slate-50 ${preview ? 'border-black' : 'border-slate-200 hover:border-black'}`}>
              {preview ? (
                <div className="relative w-full h-full group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        formik.setFieldValue('insideSubCategoryImage', null);
                      }}
                      className="bg-white text-black p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <MdCloudUpload size={24} className="text-slate-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">Drop your image here</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">PNG, JPG or WebP up to 5MB</p>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                id="insideSubCategoryImage"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-1.5">
            <label htmlFor="insideSubCategoryName" className="text-sm font-bold text-slate-700 ml-1">
              Inside Sub Category Name
            </label>
            <input
              id="insideSubCategoryName"
              name="insideSubCategoryName"
              type="text"
              placeholder="e.g. Polo Shirts"
              className={`w-full px-5 py-3.5 rounded-2xl border transition-all outline-none text-sm font-medium ${formik.touched.insideSubCategoryName && formik.errors.insideSubCategoryName
                ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                : 'border-slate-200 focus:border-black focus:ring-4 focus:ring-black/5'
                }`}
              {...formik.getFieldProps('insideSubCategoryName')}
            />
            {formik.touched.insideSubCategoryName && formik.errors.insideSubCategoryName && (
              <p className="text-xs font-bold text-red-500 ml-1 mt-1">{formik.errors.insideSubCategoryName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="subCategoryId" className="text-sm font-bold text-slate-700 ml-1">
              Sub Category
            </label>
            <select
              id="subCategoryId"
              name="subCategoryId"
              className={`w-full px-5 py-3.5 rounded-2xl border transition-all outline-none text-sm font-medium ${formik.touched.subCategoryId && formik.errors.subCategoryId
                ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                : 'border-slate-200 focus:border-black focus:ring-4 focus:ring-black/5'
                }`}
              {...formik.getFieldProps('subCategoryId')}
            >
              <option value="">Select Sub Category</option>
              {subCategories.map((subCat) => (
                <option key={subCat._id} value={subCat._id}>
                  {subCat.subCategoryName}
                </option>
              ))}
            </select>
            {formik.touched.subCategoryId && formik.errors.subCategoryId && (
              <p className="text-xs font-bold text-red-500 ml-1 mt-1">{formik.errors.subCategoryId}</p>
            )}
          </div>
        </div>

        {/* Attributes Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-bold text-slate-700">Product Attributes</label>
              <p className="text-xs text-slate-500 mt-0.5">Define size, material, or other variant options</p>
            </div>
            <button
              type="button"
              onClick={() => setAttributes([...attributes, { name: '', type: 'size', values: [], isRequired: false }])}
              className="flex items-center gap-1 text-xs font-bold text-black hover:bg-slate-100 px-3 py-2 rounded-lg transition-all"
            >
              <MdAdd size={16} />
              Add Attribute
            </button>
          </div>

          {attributes.map((attr, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Attribute {index + 1}</span>
                <button
                  type="button"
                  onClick={() => setAttributes(attributes.filter((_, i) => i !== index))}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <MdDelete size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 ml-1">Attribute Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Size, Material"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium"
                    value={attr.name}
                    onChange={(e) => {
                      const newAttrs = [...attributes];
                      newAttrs[index].name = e.target.value;
                      setAttributes(newAttrs);
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 ml-1">Type</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium"
                    value={attr.type}
                    onChange={(e) => {
                      const newAttrs = [...attributes];
                      newAttrs[index].type = e.target.value;
                      setAttributes(newAttrs);
                    }}
                  >
                    <option value="size">Size</option>
                    <option value="color">Color</option>
                    <option value="material">Material</option>
                    <option value="style">Style</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 ml-1">Values (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. S, M, L, XL, XXL"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium"
                  value={attr.values.join(', ')}
                  onChange={(e) => {
                    const newAttrs = [...attributes];
                    newAttrs[index].values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                    setAttributes(newAttrs);
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black"
                  checked={attr.isRequired}
                  onChange={(e) => {
                    const newAttrs = [...attributes];
                    newAttrs[index].isRequired = e.target.checked;
                    setAttributes(newAttrs);
                  }}
                />
                <label className="text-xs font-medium text-slate-700">Required field</label>
              </div>
            </div>
          ))}

          {attributes.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No attributes added. Click "Add Attribute" to define product options.
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 hover:text-black transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formik.isValid}
            className="flex-[2] px-6 py-3.5 bg-black hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black rounded-2xl shadow-2xl shadow-black/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {isLoading ? (
              <AiOutlineLoading3Quarters size={20} className="animate-spin" />
            ) : (
              <MdSave size={20} />
            )}
            {initialValues ? 'Save Changes' : 'Create Inside Sub Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InsideSubCategoryForm;
