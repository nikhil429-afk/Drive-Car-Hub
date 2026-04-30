import React, { useState, useEffect, useMemo } from 'react';
import type { CarListing } from '../types/car'; 

interface AdminPageProps {
    onBack: () => void;
}

interface RegisteredUser {
    id: string;
    uid: string;
    email: string;
    isAdmin?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
    const [allListings, setAllListings] = useState<CarListing[]>([]);
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
    const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectingListingId, setRejectingListingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmittingReject, setIsSubmittingReject] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        refreshDashboard();
    }, []);

    const refreshDashboard = async () => {
        setLoading(true);
        setUsersLoading(true);
        await Promise.all([fetchAllListings(), fetchRegisteredUsers()]);
    };

    const fetchAllListings = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/listings`);
            if (response.ok) {
                const listings = await response.json();
                setAllListings(Array.isArray(listings) ? listings : []);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRegisteredUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/users`);
            if (response.ok) {
                const users = await response.json();
                setRegisteredUsers(Array.isArray(users) ? users : []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setUsersLoading(false);
        }
    };

    const stats = useMemo(() => ({
        total: allListings.length,
        pending: allListings.filter((l) => l.verificationStatus === 'pending').length,
        verified: allListings.filter((l) => l.verificationStatus === 'verified').length,
        rejected: allListings.filter((l) => l.verificationStatus === 'rejected').length,
    }), [allListings]);

    const filteredListings = useMemo(() => {
        if (activeFilter === 'all') return allListings;
        return allListings.filter((l) => l.verificationStatus === activeFilter);
    }, [allListings, activeFilter]);

    const soldListings = useMemo(
        () => allListings.filter((listing) => listing.status === 'sold'),
        [allListings],
    );

    const totalCommission = useMemo(
        () => soldListings.reduce((sum, listing) => {
            const adminCommission = (listing as any).adminCommission;
            if (typeof adminCommission === 'number') return sum + adminCommission;
            return sum + ((listing.price || 0) * 2) / 100;
        }, 0),
        [soldListings],
    );

    const handleApprove = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/admin/listings/${id}/verify`, {
                method: 'PUT',
            });
            if (response.ok) {
                const updated = await response.json();
                setAllListings(prev => prev.map((listing) =>
                    listing.id === id ? { ...listing, ...updated } : listing,
                ));
            }
        } catch (error) {
            console.error('Error approving listing:', error);
        }
    };

    const handleRejectClick = (id: string) => {
        setRejectingListingId(id);
        setRejectionReason('');
        setShowRejectDialog(true);
    };

    const handleDeleteListing = async (id: string) => {
        const confirmed = window.confirm('Delete this car listing? This action cannot be undone.');
        if (!confirmed) return;

        setDeletingListingId(id);
        try {
            const response = await fetch(`${API_URL}/admin/listings/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete listing');
            }

            setAllListings((prev) => prev.filter((listing) => listing.id !== id));
        } catch (error) {
            console.error('Error deleting listing:', error);
            alert('Error deleting listing. Please try again.');
        } finally {
            setDeletingListingId(null);
        }
    };

    const handleDeleteUser = async (user: RegisteredUser) => {
        if (user.isAdmin) {
            alert('Admin user cannot be deleted.');
            return;
        }

        const confirmed = window.confirm(`Delete user ${user.email}? This action cannot be undone.`);
        if (!confirmed) return;

        setDeletingUserId(user.id);
        try {
            const response = await fetch(`${API_URL}/admin/users/${user.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete user');
            }

            setRegisteredUsers((prev) => prev.filter((u) => u.id !== user.id));
        } catch (error: any) {
            console.error('Error deleting user:', error);
            alert(error.message || 'Error deleting user. Please try again.');
        } finally {
            setDeletingUserId(null);
        }
    };

    const handleRejectConfirm = async () => {
        if (!rejectingListingId) return;

        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        setIsSubmittingReject(true);
        try {
            const response = await fetch(`${API_URL}/admin/listings/${rejectingListingId}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason: rejectionReason }),
            });

            if (response.ok) {
                const updated = await response.json();
                setAllListings(prev => prev.map((listing) =>
                    listing.id === rejectingListingId ? { ...listing, ...updated } : listing,
                ));
                setShowRejectDialog(false);
                setRejectingListingId(null);
                setRejectionReason('');
            }
        } catch (error) {
            console.error('Error rejecting listing:', error);
            alert('Error rejecting listing. Please try again.');
        } finally {
            setIsSubmittingReject(false);
        }
    };

    const getStatusStyle = (status: CarListing['verificationStatus']): React.CSSProperties => {
        if (status === 'verified') return { backgroundColor: '#166534', color: '#dcfce7' };
        if (status === 'rejected') return { backgroundColor: '#7f1d1d', color: '#fee2e2' };
        return { backgroundColor: '#713f12', color: '#fef3c7' };
    };

    const getFilterBtnStyle = (filter: 'all' | 'pending' | 'verified' | 'rejected'): React.CSSProperties => ({
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid #4b5563',
        fontWeight: 700,
        cursor: 'pointer',
        backgroundColor: activeFilter === filter ? '#dc2626' : '#374151',
        color: '#fff',
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#111827', padding: '88px 16px 24px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', borderBottom: '1px solid #7f1d1d', paddingBottom: '12px' }}>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#fff' }}>
                        Admin Dashboard
                    </h1>
                    <button 
                        onClick={onBack} 
                        style={{ background: 'transparent', color: '#f87171', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                    >
                        ← Back to Home
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', padding: '14px', borderLeft: '4px solid #f59e0b' }}>
                        <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>Pending</p>
                        <p style={{ margin: '6px 0 0', color: '#fbbf24', fontSize: '1.7rem', fontWeight: 800 }}>{stats.pending}</p>
                    </div>
                    <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', padding: '14px', borderLeft: '4px solid #10b981' }}>
                        <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>Approved</p>
                        <p style={{ margin: '6px 0 0', color: '#34d399', fontSize: '1.7rem', fontWeight: 800 }}>{stats.verified}</p>
                    </div>
                    <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', padding: '14px', borderLeft: '4px solid #ef4444' }}>
                        <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>Rejected</p>
                        <p style={{ margin: '6px 0 0', color: '#f87171', fontSize: '1.7rem', fontWeight: 800 }}>{stats.rejected}</p>
                    </div>
                    <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', padding: '14px', borderLeft: '4px solid #3b82f6' }}>
                        <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>All Uploaded</p>
                        <p style={{ margin: '6px 0 0', color: '#60a5fa', fontSize: '1.7rem', fontWeight: 800 }}>{stats.total}</p>
                    </div>
                    <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', padding: '14px', borderLeft: '4px solid #8b5cf6' }}>
                        <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>Cars Sold</p>
                        <p style={{ margin: '6px 0 0', color: '#c4b5fd', fontSize: '1.7rem', fontWeight: 800 }}>{soldListings.length}</p>
                    </div>
                    <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', padding: '14px', borderLeft: '4px solid #14b8a6' }}>
                        <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>Total Commission (2%)</p>
                        <p style={{ margin: '6px 0 0', color: '#5eead4', fontSize: '1.7rem', fontWeight: 800 }}>₹{totalCommission.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', padding: '14px', borderLeft: '4px solid #f97316' }}>
                        <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>Registered Users</p>
                        <p style={{ margin: '6px 0 0', color: '#fdba74', fontSize: '1.7rem', fontWeight: 800 }}>{registeredUsers.length}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
                    <button style={getFilterBtnStyle('pending')} onClick={() => setActiveFilter('pending')}>Pending</button>
                    <button style={getFilterBtnStyle('verified')} onClick={() => setActiveFilter('verified')}>Approved</button>
                    <button style={getFilterBtnStyle('rejected')} onClick={() => setActiveFilter('rejected')}>Rejected</button>
                    <button style={getFilterBtnStyle('all')} onClick={() => setActiveFilter('all')}>All Uploaded</button>
                    <button
                        style={{ marginLeft: 'auto', padding: '10px 14px', borderRadius: '10px', border: '1px solid #4b5563', backgroundColor: '#1f2937', color: '#e5e7eb', fontWeight: 700, cursor: 'pointer' }}
                        onClick={refreshDashboard}
                    >
                        Refresh
                    </button>
                </div>

                <h2 style={{ color: '#fff', margin: '0 0 12px', fontSize: '1.35rem' }}>Uploaded Cars ({activeFilter.toUpperCase()})</h2>
                
                {loading ? (
                    <div style={{ textAlign: 'center', backgroundColor: '#1f2937', borderRadius: '12px', padding: '24px', color: '#9ca3af' }}>
                        Loading listings...
                    </div>
                ) : filteredListings.length > 0 ? (
                    <div style={{ overflowX: 'auto', border: '1px solid #374151', borderRadius: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1080px', backgroundColor: '#111827' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#1f2937' }}>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Car</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Price</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Vehicle No.</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Owner</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Contact</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Status</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Reason</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredListings.map((listing) => (
                                    <tr key={listing.id} style={{ borderBottom: '1px solid #1f2937' }}>
                                        <td style={{ padding: '10px', color: '#f9fafb' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img
                                                    src={listing.imageUrls?.[0] || 'https://placehold.co/120x80/1f2937/ffffff?text=No+Image'}
                                                    alt={`${listing.make} ${listing.model}`}
                                                    style={{ width: '64px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #374151' }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: 700 }}>{listing.year} {listing.make} {listing.model}</div>
                                                    <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Mileage: {listing.mileage?.toLocaleString()} KM</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '10px', color: '#fca5a5', fontWeight: 700 }}>₹{listing.price?.toLocaleString()}</td>
                                        <td style={{ padding: '10px', color: '#e5e7eb' }}>{(listing as any).vehicleNumber || '-'}</td>
                                        <td style={{ padding: '10px', color: '#e5e7eb' }}>{(listing as any).ownerName || '-'}</td>
                                        <td style={{ padding: '10px', color: '#e5e7eb' }}>{(listing as any).ownerContactNumber || '-'}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{ ...getStatusStyle(listing.verificationStatus), padding: '4px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                {listing.verificationStatus.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px', color: '#fca5a5', maxWidth: '220px' }}>{(listing as any).rejectionReason || '-'}</td>
                                        <td style={{ padding: '10px' }}>
                                            {listing.verificationStatus === 'pending' ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleApprove(listing.id)}
                                                        style={{ padding: '7px 10px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectClick(listing.id)}
                                                        style={{ padding: '7px 10px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteListing(listing.id)}
                                                        disabled={deletingListingId === listing.id}
                                                        style={{ padding: '7px 10px', borderRadius: '8px', border: 'none', backgroundColor: '#4b5563', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: deletingListingId === listing.id ? 0.6 : 1 }}
                                                    >
                                                        {deletingListingId === listing.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No review action</span>
                                                    <button
                                                        onClick={() => handleDeleteListing(listing.id)}
                                                        disabled={deletingListingId === listing.id}
                                                        style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: '#4b5563', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: deletingListingId === listing.id ? 0.6 : 1 }}
                                                    >
                                                        {deletingListingId === listing.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', backgroundColor: '#1f2937', borderRadius: '12px', padding: '24px', color: '#9ca3af' }}>
                        No listings in this filter.
                    </div>
                )}

                <h2 style={{ color: '#fff', margin: '20px 0 12px', fontSize: '1.35rem' }}>Sold Cars and Commission</h2>
                {soldListings.length > 0 ? (
                    <div style={{ overflowX: 'auto', border: '1px solid #374151', borderRadius: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '920px', backgroundColor: '#111827' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#1f2937' }}>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Car</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Sold Price</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Admin Commission (2%)</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Seller Amount</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Buyer UID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {soldListings.map((listing) => {
                                    const adminCommission = typeof (listing as any).adminCommission === 'number'
                                        ? (listing as any).adminCommission
                                        : (listing.price * 2) / 100;
                                    const sellerAmount = typeof (listing as any).sellerAmount === 'number'
                                        ? (listing as any).sellerAmount
                                        : listing.price - adminCommission;

                                    return (
                                        <tr key={`sold-${listing.id}`} style={{ borderBottom: '1px solid #1f2937' }}>
                                            <td style={{ padding: '10px', color: '#f9fafb' }}>{listing.year} {listing.make} {listing.model}</td>
                                            <td style={{ padding: '10px', color: '#fca5a5', fontWeight: 700 }}>₹{listing.price.toLocaleString()}</td>
                                            <td style={{ padding: '10px', color: '#5eead4', fontWeight: 700 }}>₹{adminCommission.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                            <td style={{ padding: '10px', color: '#d1fae5' }}>₹{sellerAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                            <td style={{ padding: '10px', color: '#e5e7eb', fontFamily: 'monospace', fontSize: '0.85rem' }}>{listing.buyerUid || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', backgroundColor: '#1f2937', borderRadius: '12px', padding: '24px', color: '#9ca3af' }}>
                        No sold cars yet. Commission will appear after purchases.
                    </div>
                )}

                <h2 style={{ color: '#fff', margin: '20px 0 12px', fontSize: '1.35rem' }}>Registered Users</h2>
                {usersLoading ? (
                    <div style={{ textAlign: 'center', backgroundColor: '#1f2937', borderRadius: '12px', padding: '24px', color: '#9ca3af' }}>
                        Loading users...
                    </div>
                ) : registeredUsers.length > 0 ? (
                    <div style={{ overflowX: 'auto', border: '1px solid #374151', borderRadius: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '860px', backgroundColor: '#111827' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#1f2937' }}>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Email</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>UID</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Role</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Registered On</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Updated On</th>
                                    <th style={{ textAlign: 'left', padding: '10px', color: '#d1d5db', borderBottom: '1px solid #374151' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registeredUsers.map((user) => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #1f2937' }}>
                                        <td style={{ padding: '10px', color: '#f9fafb' }}>{user.email}</td>
                                        <td style={{ padding: '10px', color: '#d1d5db', fontFamily: 'monospace', fontSize: '0.85rem' }}>{user.uid}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{ padding: '4px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: user.isAdmin ? '#7c2d12' : '#1f2937', color: user.isAdmin ? '#fed7aa' : '#d1d5db', border: '1px solid #4b5563' }}>
                                                {user.isAdmin ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px', color: '#9ca3af' }}>{user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</td>
                                        <td style={{ padding: '10px', color: '#9ca3af' }}>{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '-'}</td>
                                        <td style={{ padding: '10px' }}>
                                            {user.isAdmin ? (
                                                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Protected</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    disabled={deletingUserId === user.id}
                                                    style={{ padding: '7px 10px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: deletingUserId === user.id ? 0.6 : 1 }}
                                                >
                                                    {deletingUserId === user.id ? 'Deleting...' : 'Delete User'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', backgroundColor: '#1f2937', borderRadius: '12px', padding: '24px', color: '#9ca3af' }}>
                        No registered users found.
                    </div>
                )}
            </div>

            {showRejectDialog && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 80 }}>
                    <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#1f2937', border: '1px solid #dc2626', borderRadius: '12px', padding: '18px' }}>
                        <h2 style={{ color: '#fff', marginTop: 0 }}>Reject Listing</h2>
                        <p style={{ color: '#d1d5db', marginTop: 0 }}>Provide a reason visible to the seller.</p>
                        
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="E.g., Images not clear, pricing seems too high, registration details incomplete..."
                            rows={5}
                            maxLength={500}
                            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #4b5563', backgroundColor: '#111827', color: '#fff', resize: 'none' }}
                        />
                        
                        <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{rejectionReason.length}/500 characters</p>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setShowRejectDialog(false)}
                                disabled={isSubmittingReject}
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#4b5563', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectConfirm}
                                disabled={isSubmittingReject || !rejectionReason.trim()}
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: (isSubmittingReject || !rejectionReason.trim()) ? 0.6 : 1 }}
                            >
                                {isSubmittingReject ? 'Rejecting...' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
