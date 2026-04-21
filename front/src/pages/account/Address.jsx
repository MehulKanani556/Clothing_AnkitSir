import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AccountLayout from './AccountLayout';
import AddressSidebar from './AddressSidebar';
import { fetchAddresses, deleteAddress, selectAddress } from '../../redux/slice/address.slice';
import { FaPlus, FaHome, FaBriefcase, FaMapMarkerAlt } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

// Icon per address type
const TYPE_ICON = {
    Home: <FaHome className="text-sm md:text-base" />,
    Office: <FaBriefcase className="text-sm md:text-base" />,
    Other: <FaMapMarkerAlt className="text-sm md:text-base" />,
};

// ── Confirm Remove Modal ──────────────────────────────────────────────────────
function ConfirmRemoveModal({ isOpen, onCancel, onConfirm, loading }) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 z-50" onClick={onCancel} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="bg-white w-full max-w-sm p-6 relative">

                    <div className="flex justify-between items-center">
                        {/* Content */}
                        <h3 className="text-xl md:text-2xl font-bold text-primary mb-1">Remove this address?</h3>

                        {/* Close */}
                        <button
                            onClick={onCancel}
                            className="text-lightText hover:text-dark transition-colors"
                            aria-label="Close"
                        >
                            <IoClose className="text-2xl" />
                        </button>
                    </div>
                    <p className="text-sm md:text-base text-lightText mb-3 md:mb-6">
                        This address will be removed from your account
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 text-xs md:text-sm font-bold text-dark uppercase tracking-widest md:py-3 py-2 hover:opacity-60 transition-opacity"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 bg-primary text-white text-xs md:text-sm font-bold uppercase tracking-widest md:py-3 py-2 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Removing...' : 'Remove'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function AddressCard({ addr, isDefault, onEdit, onDelete, onSetDefault, actionLoading }) {
    const fullName = [addr.firstName, addr.lastName].filter(Boolean).join(' ');
    const addressType = addr.addressType || 'Other';
    const fullAddress = [addr.address, addr.aptSuite, addr.city, addr.state, addr.zipcode]
        .filter(Boolean)
        .join(', ');

    return (
        <div className="bg-white p-5">
            {/* Top row */}
            <div className="flex md:flex-row flex-col md:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm md:text-base font-semibold text-primary">{fullName}</span>
                    <div className="border-l border-border h-5 w-px"></div>
                    <span className="flex items-center gap-2 text-sm md:text-base font-semibold text-mainText uppercase tracking-wide px-1.5 py-0.5">
                        {TYPE_ICON[addressType]}
                        {addressType}
                    </span>
                    {isDefault && (
                        <>
                            <div className="border-l border-border h-5 w-px"></div>
                            <span className="text-sm md:text-base font-semibold text-lightText uppercase tracking-wide">
                                (Default)
                            </span>
                        </>
                    )}
                </div>
                <div className="flex items-center justify-end gap-3 shrink-0">
                    <button
                        onClick={onEdit}
                        className="text-sm md:text-base font-medium text-primary transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={actionLoading}
                        className="text-sm md:text-base font-medium text-lightText transition-colors disabled:opacity-50"
                    >
                        Remove
                    </button>
                </div>
            </div>

            {/* Phone */}
            {addr.phone && (
                <p className="text-sm md:text-base font-medium text-lightText mt-1">{addr.phone}</p>
            )}

            <div className="mt-1 flex justify-between md:items-center gap-2 md:flex-row flex-col">

                {/* Address line */}
                <p className="text-sm md:text-base font-semibold text-primary ">{fullAddress}</p>

                {/* Set as default */}
                {!isDefault && (
                    <button
                        onClick={onSetDefault}
                        disabled={actionLoading}
                        className="text-sm md:text-base font-semibold text-primary hover:underline disabled:opacity-50 transition-colors text-right"
                    >
                        Set as default
                    </button>
                )}
            </div>
        </div>
    );
}

export default function Address() {
    const dispatch = useDispatch();
    const { addresses, selectedAddressId, loading, actionLoading, error } = useSelector((state) => state.address);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editAddress, setEditAddress] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        dispatch(fetchAddresses());
    }, [dispatch]);

    const handleOpenAdd = () => {
        setEditAddress(null);
        setSidebarOpen(true);
    };

    const handleOpenEdit = (addr) => {
        setEditAddress(addr);
        setSidebarOpen(true);
    };

    const handleClose = () => {
        setSidebarOpen(false);
        setEditAddress(null);
    };

    const handleDelete = (addressId) => {
        setConfirmDeleteId(addressId);
    };

    const handleConfirmDelete = () => {
        dispatch(deleteAddress(confirmDeleteId)).then(() => {
            setConfirmDeleteId(null);
        });
    };

    const handleSetDefault = (addressId) => {
        dispatch(selectAddress(addressId));
    };

    return (
        <AccountLayout>
            <div className="flex flex-col min-h-[calc(100vh-10rem)] md:min-h-[calc(100vh-17rem)]">

                {/* Page title */}
                <div className="flex justify-between items-center md:mb-8 mb-4">
                    <h1 className="text-xl md:text-[28px] font-semibold text-primary">Addresses</h1>
                    {addresses.length > 0 && (
                        <button
                            onClick={handleOpenAdd}
                            className="inline-flex items-center gap-2 bg-primary text-white text-xs md:text-sm font-semibold md:px-5 px-2 py-2.5 hover:bg-primary/90 transition-colors"
                        >
                            <FaPlus className="text-xs" />
                            Add New Address
                        </button>
                    )}
                </div>

                {/* Loading skeletons */}
                {loading && (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map((n) => (
                            <div
                                key={n}
                                className="bg-white border border-border p-5 animate-pulse h-28"
                            />
                        ))}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="flex-1 flex items-center justify-center text-red-500 text-sm">
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && addresses.length === 0 && (
                    <div className="flex flex-col items-center justify-center flex-1 min-h-[60vh] gap-3 text-center">
                        <p className="text-xl font-semibold text-dark">No addresses added yet</p>
                        <p className="text-sm text-lightText max-w-xs">
                            Add your delivery details to simplify future orders and ensure a seamless checkout
                        </p>
                        <button
                            onClick={handleOpenAdd}
                            className="mt-2 inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 hover:bg-primary/90 transition-colors"
                        >
                            <FaPlus className="text-sm" />
                            Add New Address
                        </button>
                    </div>
                )}

                {/* Address list */}
                {!loading && !error && addresses.length > 0 && (
                    <div className="flex flex-col gap-4">
                        {addresses.map((addr) => (
                            <AddressCard
                                key={addr._id}
                                addr={addr}
                                isDefault={addr._id?.toString() === selectedAddressId?.toString()}
                                onEdit={() => handleOpenEdit(addr)}
                                onDelete={() => handleDelete(addr._id)}
                                onSetDefault={() => handleSetDefault(addr._id)}
                                actionLoading={actionLoading}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add / Edit Sidebar */}
            <AddressSidebar
                isOpen={sidebarOpen}
                onClose={handleClose}
                editAddress={editAddress}
            />

            {/* Confirm Remove Modal */}
            <ConfirmRemoveModal
                isOpen={!!confirmDeleteId}
                onCancel={() => setConfirmDeleteId(null)}
                onConfirm={handleConfirmDelete}
                loading={actionLoading}
            />
        </AccountLayout>
    );
}
