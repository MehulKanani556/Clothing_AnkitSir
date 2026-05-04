import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createLookbook, updateLookbook, fetchLookbooksAdmin } from '../../../redux/slice/lookbook.slice';
import { fetchProducts } from '../../../redux/slice/product.slice';
import { MdClose, MdCloudUpload, MdSearch, MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';

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
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          {initialValues ? 'Edit Lookbook' : 'Create New Look'}
        </h3>
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
          <MdClose size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Look Title</label>
              <input 
                type="text" 
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-bold"
                placeholder="e.g., Summer Archive 2024"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</label>
              <textarea 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-bold min-h-[100px] resize-none"
                placeholder="Share the story behind this look..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="flex gap-8">
                <div className="space-y-2 flex-1">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Display Order</label>
                    <input 
                        type="number" 
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-bold"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value)})}
                    />
                </div>
                <div className="space-y-2 flex items-center pt-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            className="hidden"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        />
                        <div className={`w-12 h-6 rounded-full transition-all relative ${formData.isActive ? 'bg-black' : 'bg-slate-200'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isActive ? 'left-7' : 'left-1'}`}></div>
                        </div>
                        <span className="text-sm font-bold text-slate-600">Active</span>
                    </label>
                </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Main Look Image</label>
            <div 
              className={`relative h-[200px] border-2 border-dashed rounded-3xl overflow-hidden transition-all group ${imagePreview ? 'border-transparent' : 'border-slate-200 hover:border-black bg-slate-50'}`}
              onClick={() => document.getElementById('lookImage').click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm cursor-pointer">
                    <MdCloudUpload className="text-white" size={32} />
                    <span className="text-white font-bold ml-2">Change Image</span>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center cursor-pointer">
                  <MdCloudUpload className="text-slate-300 group-hover:text-black transition-colors" size={48} />
                  <p className="text-slate-400 font-bold text-sm mt-2">Click to upload image</p>
                </div>
              )}
              <input type="file" id="lookImage" className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Link Products ({formData.products.length}/4)</label>
            <div className="relative w-64">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs focus:border-black transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredProducts.map(product => {
              const isSelected = formData.products.includes(product._id);
              return (
                <div 
                  key={product._id}
                  onClick={() => toggleProduct(product._id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'bg-black border-black text-white' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    <img src={product.variants?.[0]?.images?.[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>{product.name}</p>
                    <p className={`text-[10px] ${isSelected ? 'text-white/50' : 'text-slate-400'}`}>ID: #{product._id.slice(-6)}</p>
                  </div>
                  {isSelected ? <MdCheckCircle className="text-white" size={20} /> : <MdRadioButtonUnchecked className="text-slate-200" size={20} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="flex-1 px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (initialValues ? 'Update Look' : 'Create Look')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LookbookForm;
