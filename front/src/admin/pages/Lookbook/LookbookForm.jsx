import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createLookbook, updateLookbook, fetchLookbooksAdmin } from '../../../redux/slice/lookbook.slice';
import { fetchProducts } from '../../../redux/slice/product.slice';
import { MdClose, MdCloudUpload, MdSearch, MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const LookbookForm = ({ initialValues, onCancel, isLoading }) => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isActive: true,
    displayOrder: 0,
    products: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
    if (initialValues) {
      setFormData({
        title: initialValues.title || '',
        description: initialValues.description || '',
        isActive: initialValues.isActive ?? true,
        displayOrder: initialValues.displayOrder || 0,
        products: initialValues.products?.map(p => p._id || p) || []
      });
      setImagePreview(initialValues.lookImage);
    }
  }, [initialValues, dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleProduct = (productId) => {
    setFormData(prev => {
      const isSelected = prev.products.includes(productId);
      if (isSelected) {
        return { ...prev, products: prev.products.filter(id => id !== productId) };
      } else {
        if (prev.products.length >= 4) {
          alert('You can only select up to 4 products for a lookbook.');
          return prev;
        }
        return { ...prev, products: [...prev.products, productId] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('isActive', formData.isActive);
    data.append('displayOrder', formData.displayOrder);

    // Append product IDs one by one (or as stringified array depending on backend logic)
    // Our backend expects products array in body. 
    // FormData doesn't support arrays directly, so we append multiple times or stringify.
    if (formData.products && formData.products.length > 0) {
      data.append('products', JSON.stringify(formData.products));
    }

    if (imageFile) {
      data.append('lookImage', imageFile);
    }

    const action = initialValues
      ? updateLookbook({ id: initialValues._id, formData: data })
      : createLookbook(data);

    dispatch(action).then((res) => {
      if (!res.error) {
        dispatch(fetchLookbooksAdmin());
        onCancel();
      }
    });
  };

  const filteredProducts = products?.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="bg-background rounded-none shadow-2xl overflow-hidden border border-border">
      <div className="px-10 py-8 border-b border-border flex justify-between items-center bg-mainBG/30">
        <div>
          <h3 className="text-xl font-black text-mainText tracking-tight">
            {initialValues ? 'Edit Lookbook' : 'Add New Lookbook'}
          </h3>
          <p className="text-[10px] text-lightText font-black uppercase tracking-widest mt-0.5">Lookbook Details</p>
        </div>
        <button
          onClick={onCancel}
          className="p-3 hover:bg-white rounded-none transition-all text-lightText hover:text-primary border border-transparent hover:border-border active:scale-95"
        >
          <MdClose size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="space-y-2.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">Lookbook Title</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 bg-mainBG/10 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-black tracking-tight"
                placeholder="e.g., Summer Archive 2024"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">Lookbook Description</label>
              <textarea
                className="w-full px-6 py-4 bg-mainBG/10 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-medium min-h-[120px] resize-none"
                placeholder="Share the story behind this look..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex gap-8 items-end">
              <div className="space-y-2.5 flex-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">Sequence Weight</label>
                <input
                  type="number"
                  className="w-full px-6 py-4 bg-mainBG/10 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-black tracking-tight"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2.5 pb-2">
                <label className="flex items-center gap-4 cursor-pointer group p-3.5 border border-border rounded-none bg-mainBG/10 hover:border-primary/20 transition-all">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <div className={`w-12 h-6 rounded-none transition-all duration-500 relative ${formData.isActive ? 'bg-primary' : 'bg-lightText/20'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-none bg-white transition-all duration-500 shadow-xl ${formData.isActive ? 'left-7' : 'left-1'}`}></div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${formData.isActive ? 'text-primary' : 'text-lightText'}`}>Live</span>
                </label>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">Primary Visual Asset</label>
            <div
              className={`relative h-[280px] border-2 border-dashed rounded-none overflow-hidden transition-all duration-500 group cursor-pointer ${imagePreview ? 'border-primary' : 'border-border hover:border-primary bg-mainBG/5'}`}
              onClick={() => document.getElementById('lookImage').click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-sm">
                    <div className="bg-white p-4 rounded-none shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                      <MdCloudUpload className="text-primary" size={32} />
                    </div>
                    <span className="text-white font-black uppercase tracking-widest text-[10px] mt-4">Redefine Narrative Media</span>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-none flex items-center justify-center shadow-sm border border-border group-hover:scale-110 transition-transform duration-500">
                    <MdCloudUpload className="text-primary" size={32} />
                  </div>
                  <p className="text-lightText font-black text-[10px] uppercase tracking-widest mt-4">Drag & Drop Hero Image</p>
                </div>
              )}
              <input type="file" id="lookImage" className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-lightText opacity-70">Curated Product Links</label>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.1em] mt-1.5">Selected {formData.products.length} of 4 Threshold</p>
            </div>
            <div className="relative group">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lightText group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Query inventory..."
                className="w-72 pl-11 pr-6 py-3 bg-mainBG/10 border border-border rounded-none outline-none text-xs font-black tracking-tight focus:border-primary transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[360px] overflow-y-auto pr-3 custom-scrollbar">
            {filteredProducts.map(product => {
              const isSelected = formData.products.includes(product._id);
              return (
                <div
                  key={product._id}
                  onClick={() => toggleProduct(product._id)}
                  className={`flex items-center gap-4 p-4 rounded-none border-2 transition-all duration-300 cursor-pointer group ${isSelected ? 'bg-primary border-primary shadow-xl shadow-primary/20 scale-[0.98]' : 'bg-white border-border hover:border-primary/20 hover:shadow-lg hover:shadow-black/5'}`}
                >
                  <div className="w-12 h-12 rounded-none bg-mainBG/10 overflow-hidden flex-shrink-0 border border-border/50">
                    <img src={product.variants?.[0]?.images?.[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-black truncate uppercase tracking-tight ${isSelected ? 'text-white' : 'text-mainText'}`}>{product.name}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isSelected ? 'text-white/60' : 'text-lightText/60'}`}>SKU: #{product._id.slice(-6)}</p>
                  </div>
                  <div className={`transition-all duration-500 ${isSelected ? 'scale-110 rotate-0' : 'scale-75 -rotate-45'}`}>
                    {isSelected ? <MdCheckCircle className="text-white" size={24} /> : <MdRadioButtonUnchecked className="text-lightText opacity-20" size={24} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-8 py-4 border border-border text-lightText rounded-none font-black uppercase tracking-widest text-[11px] hover:bg-mainBG transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-[2] px-8 py-4 bg-primary text-white rounded-none font-black uppercase tracking-[0.15em] text-[11px] hover:opacity-90 transition-all shadow-2xl shadow-primary/20 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <><AiOutlineLoading3Quarters size={20} className="animate-spin" /> Saving...</>
            ) : (
              initialValues ? (
                <><MdCheckCircle size={20} /> Update Lookbook</>
              ) : (
                <><MdCloudUpload size={20} /> Create Lookbook</>
              )
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LookbookForm;
