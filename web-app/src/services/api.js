import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/TRAITS-PMS/backend/api',
});

// 🔁 Automatically attach token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ⚠️ Handle 401 Unauthorized globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);


// ✅ Authentication
export const login = (username, password) =>
    api.post('/auth.php', { username, password });

// ✅ Owners
export const createOwner = (data) => api.post('/lease.php', data);
export const getOwners = () => api.get('/lease.php');

// ✅ Leases
export const createLease = (formData) =>
    api.post('/lease.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
export const getLeases = (ownerId) => api.get(`/lease.php?owner_id=${ownerId}`);
export const renewLease = (leaseId) => api.put('/lease.php', { lease_id: leaseId });
export const bulkUploadOwners = (formData) =>
    api.post('/lease.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// ✅ Properties
export const createProperty = (data) => api.post('/property.php', data);
export const getProperties = () => api.get('/property.php');
export const getPropertyDetails = (propertyId) =>
    api.get(`/property.php?property_id=${propertyId}`);
export const bulkUploadProperties = (formData) =>
    api.post('/property.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// ✅ Tenants
export const createTenant = (data) => api.post('/tenant.php', data);
export const getTenants = () => api.get('/tenant.php');
export const getTenantDetails = (tenantId) =>
    api.get(`/tenant.php?tenant_id=${tenantId}`);
export const bulkUploadTenants = (formData) =>
    api.post('/tenant.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// ✅ Rent
export const assignTenant = (data) => api.post('/rent.php', data);
export const getAssignments = () => api.get('/rent.php');
export const bulkUploadAssignments = (formData) =>
    api.post('/rent.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
export const enterRent = (data) =>
    api.post('/rent.php', {
        action: 'rent_entry',
        data: JSON.stringify(data),
    });
export const getCollectionList = () => api.get('/rent.php?view=collection_list');
export const getCollectionEntries = () => api.get('/rent.php?view=collection_entries');
export const getApprovals = () => api.get('/rent.php?view=approvals');
export const collectPayment = (paymentId) =>
    api.put('/rent.php', { action: 'collect', payment_id: paymentId });
export const approvePayment = (paymentId) =>
    api.put('/rent.php', { action: 'approve', payment_id: paymentId });

// ✅ Cheques
export const addCheque = (data) => api.post('/cheque.php', data);
export const getCheques = () => api.get('/cheque.php');
export const getChequeDetails = (chequeId) =>
    api.get(`/cheque.php?cheque_id=${chequeId}`);
export const bulkUploadCheques = (formData) =>
    api.post('/cheque.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
export const updateChequeStatus = (chequeId, status) =>
    api.put('/cheque.php', { cheque_id: chequeId, status });

// ✅ Logout helper
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
};

// ✅ Grouped exports for modular usage
export const authAPI = { login, logout };
export const ownerAPI = { createOwner, getOwners, bulkUploadOwners };
export const leaseAPI = { createLease, getLeases, renewLease };
export const rentAPI = {
    assignTenant,
    enterRent,
    getAssignments,
    getCollectionList,
    getCollectionEntries,
    getApprovals,
    collectPayment,
    approvePayment,
    bulkUploadAssignments,
};
export const tenantAPI = { createTenant, getTenants, getTenantDetails, bulkUploadTenants };
export const propertyAPI = {
    createProperty,
    getProperties,
    getPropertyDetails,
    bulkUploadProperties,
};
export const chequeAPI = {
    addCheque,
    getCheques,
    getChequeDetails,
    bulkUploadCheques,
    updateChequeStatus,
};
export const getDashboardData = async (monthFilter) => {
    try {
        const response = await api.get(`/dashboard.php?month=${monthFilter}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return { data: {} };
    }
};


export default api;
