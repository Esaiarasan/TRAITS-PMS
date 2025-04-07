import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../components/Menu';
import { createTenant, getTenants, getTenantDetails, bulkUploadTenants } from '../services/api';

const Tenant = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const navigate = useNavigate();
    const [tenants, setTenants] = useState([]);
    const [filteredTenants, setFilteredTenants] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [tenantForm, setTenantForm] = useState({
        name: '', fathers_name: '', mobile_number: '', email: '', nationality: '', address: '',
        passport_number: '', eid_number: '', reference_number: '', alternate_mobile: '', workplace: '', designation: '',
    });
    const [search, setSearch] = useState({ name: '', mobile_number: '' });

    useEffect(() => {
        fetchTenants();
    }, []);

    useEffect(() => {
        filterTenants();
    }, [tenants, search]);

    const fetchTenants = async () => {
        const response = await getTenants();
        setTenants(response.data);
        setFilteredTenants(response.data);
    };

    const filterTenants = () => {
        let result = [...tenants];
        if (search.name) {
            result = result.filter(t => t.name.toLowerCase().includes(search.name.toLowerCase()));
        }
        if (search.mobile_number) {
            result = result.filter(t => t.mobile_number?.includes(search.mobile_number));
        }
        setFilteredTenants(result);
    };

    const handleTenantChange = (e) => {
        setTenantForm({ ...tenantForm, [e.target.name]: e.target.value });
    };

    const handleTenantSubmit = async (e) => {
        e.preventDefault();
        await createTenant(tenantForm);
        fetchTenants();
        setTenantForm({
            name: '', fathers_name: '', mobile_number: '', email: '', nationality: '', address: '',
            passport_number: '', eid_number: '', reference_number: '', alternate_mobile: '', workplace: '', designation: '',
        });
    };

    const viewTenantDetails = async (tenant) => {
        const response = await getTenantDetails(tenant.tenant_id);
        setSelectedTenant(response.data);
    };

    return (
        <div style={{ display: 'flex' }}>
            <Menu user={user} />
            <div style={{ marginLeft: '12.5%', width: '87.5%' }}>
                <div style={{
                    height: '12.5vh',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    position: 'fixed',
                    width: '87.5%',
                    zIndex: 10,
                }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '50px' }} />
                    <h1 style={{ fontSize: '24px', color: '#333', margin: '0' }}>TRAITS-PMS</h1>
                    <div style={{ fontSize: '20px', cursor: 'pointer' }}>🔔</div>
                </div>
                <div style={{ padding: '20px', marginTop: '12.5vh', height: '87.5vh', overflowY: 'auto' }}>
                    {!selectedTenant ? (
                        <>
                            {/* Bulk Upload Tenants */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Bulk Upload Tenants</h2>
                                <a
                                    href="data:text/csv;charset=utf-8,name,fathers_name,mobile_number,email,nationality,address,passport_number,eid_number,reference_number,alternate_mobile,workplace,designation\n"
                                    download="tenant_template.csv"
                                    style={{ color: '#007bff', textDecoration: 'underline', marginRight: '15px' }}
                                >
                                    Download CSV Template
                                </a>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={async (e) => {
                                        const formData = new FormData();
                                        formData.append('csv_file', e.target.files[0]);
                                        await bulkUploadTenants(formData);
                                        fetchTenants();
                                    }}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Create Tenant Section */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Create New Tenant</h2>
                                <form onSubmit={handleTenantSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <input name="name" value={tenantForm.name} onChange={handleTenantChange} placeholder="Name" style={inputStyle} required />
                                    <input name="fathers_name" value={tenantForm.fathers_name} onChange={handleTenantChange} placeholder="Father's Name" style={inputStyle} />
                                    <input name="mobile_number" value={tenantForm.mobile_number} onChange={handleTenantChange} placeholder="Mobile Number" style={inputStyle} />
                                    <input name="email" value={tenantForm.email} onChange={handleTenantChange} placeholder="Email" style={inputStyle} />
                                    <input name="nationality" value={tenantForm.nationality} onChange={handleTenantChange} placeholder="Nationality" style={inputStyle} />
                                    <input name="passport_number" value={tenantForm.passport_number} onChange={handleTenantChange} placeholder="Passport Number" style={inputStyle} />
                                    <input name="eid_number" value={tenantForm.eid_number} onChange={handleTenantChange} placeholder="EID Number" style={inputStyle} />
                                    <input name="reference_number" value={tenantForm.reference_number} onChange={handleTenantChange} placeholder="Reference Number" style={inputStyle} />
                                    <input name="alternate_mobile" value={tenantForm.alternate_mobile} onChange={handleTenantChange} placeholder="Alternate Mobile" style={inputStyle} />
                                    <input name="workplace" value={tenantForm.workplace} onChange={handleTenantChange} placeholder="Workplace" style={inputStyle} />
                                    <input name="designation" value={tenantForm.designation} onChange={handleTenantChange} placeholder="Designation" style={inputStyle} />
                                    <textarea name="address" value={tenantForm.address} onChange={handleTenantChange} placeholder="Address" style={{ ...inputStyle, gridColumn: 'span 2', height: '80px' }} />
                                    <button type="submit" style={{ ...buttonStyle, gridColumn: 'span 2' }}>Add Tenant</button>
                                </form>
                            </div>

                            {/* Tenants List with Filters */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Tenants List</h2>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                    <input
                                        placeholder="Search by Name"
                                        value={search.name}
                                        onChange={(e) => setSearch({ ...search, name: e.target.value })}
                                        style={inputStyle}
                                    />
                                    <input
                                        placeholder="Search by Mobile"
                                        value={search.mobile_number}
                                        onChange={(e) => setSearch({ ...search, mobile_number: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f0f0f0' }}>
                                            <th style={tableHeaderStyle}>Tenant ID</th>
                                            <th style={tableHeaderStyle}>Name</th>
                                            <th style={tableHeaderStyle}>Father's Name</th>
                                            <th style={tableHeaderStyle}>Mobile</th>
                                            <th style={tableHeaderStyle}>Status</th>
                                            <th style={tableHeaderStyle}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTenants.map((tenant) => (
                                            <tr key={tenant.tenant_id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={tableCellStyle}>{tenant.tenant_id}</td>
                                                <td style={tableCellStyle}>{tenant.name}</td>
                                                <td style={tableCellStyle}>{tenant.fathers_name}</td>
                                                <td style={tableCellStyle}>{tenant.mobile_number}</td>
                                                <td style={tableCellStyle}>{tenant.status}</td>
                                                <td style={tableCellStyle}>
                                                    <span
                                                        style={{ cursor: 'pointer', color: '#007bff', fontSize: '18px' }}
                                                        onClick={() => viewTenantDetails(tenant)}
                                                    >
                                                        👁️
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <button onClick={() => navigate('/dashboard')} style={buttonStyle}>Home</button>
                                <button onClick={() => setSelectedTenant(null)} style={buttonStyle}>Back</button>
                            </div>
                            <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>{selectedTenant.name} - Details</h2>
                            <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
                                <p><strong>ID:</strong> {selectedTenant.tenant_id}</p>
                                <p><strong>Father's Name:</strong> {selectedTenant.fathers_name}</p>
                                <p><strong>Mobile:</strong> {selectedTenant.mobile_number}</p>
                                <p><strong>Email:</strong> {selectedTenant.email}</p>
                                <p><strong>Nationality:</strong> {selectedTenant.nationality}</p>
                                <p><strong>Address:</strong> {selectedTenant.address}</p>
                                <p><strong>Passport Number:</strong> {selectedTenant.passport_number}</p>
                                <p><strong>EID Number:</strong> {selectedTenant.eid_number}</p>
                                <p><strong>Reference Number:</strong> {selectedTenant.reference_number}</p>
                                <p><strong>Alternate Mobile:</strong> {selectedTenant.alternate_mobile}</p>
                                <p><strong>Workplace:</strong> {selectedTenant.workplace}</p>
                                <p><strong>Designation:</strong> {selectedTenant.designation}</p>
                                <p><strong>Status:</strong> {selectedTenant.status}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
};

const buttonStyle = {
    padding: '10px 20px',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background 0.3s',
};

const tableHeaderStyle = {
    padding: '10px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333',
};

const tableCellStyle = {
    padding: '10px',
    color: '#666',
};

export default Tenant;
