import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../components/Menu';
import { assignTenant, getAssignments, bulkUploadAssignments, enterRent, getCollectionList, getCollectionEntries, getApprovals, collectPayment, approvePayment, getProperties, getTenants } from '../services/api';

const Rent = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('assigning');
    const [assignments, setAssignments] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [properties, setProperties] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [assignmentForm, setAssignmentForm] = useState({
        tenant_id: '', property_id: '', tenant_code: '', start_date: '', end_date: '', monthly_rent: '',
    });
    const [rentForm, setRentForm] = useState({ assignment_id: '', amount: '', payment_date: '', due_date: '' });
    const [collectionList, setCollectionList] = useState([]);
    const [collectionEntries, setCollectionEntries] = useState([]);
    const [approvals, setApprovals] = useState([]);
    const [search, setSearch] = useState({ tenant_name: '', tenant_code: '' });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterAssignments();
    }, [assignments, search]);

    const fetchData = async () => {
        const [assignmentsRes, propertiesRes, tenantsRes] = await Promise.all([
            getAssignments(),
            getProperties(),
            getTenants(),
        ]);
        setAssignments(assignmentsRes.data);
        setFilteredAssignments(assignmentsRes.data);
        setProperties(propertiesRes.data);
        setTenants(tenantsRes.data.filter(t => t.status === 'unassigned'));

        if (activeTab === 'collection_list') fetchCollectionList();
        if (activeTab === 'collection_entries') fetchCollectionEntries();
        if (activeTab === 'approvals') fetchApprovals();
    };

    const filterAssignments = () => {
        let result = [...assignments];
        if (search.tenant_name) {
            result = result.filter(a => a.name.toLowerCase().includes(search.tenant_name.toLowerCase()));
        }
        if (search.tenant_code) {
            result = result.filter(a => a.tenant_code.toLowerCase().includes(search.tenant_code.toLowerCase()));
        }
        setFilteredAssignments(result);
    };

    const fetchCollectionList = async () => {
        const response = await getCollectionList();
        setCollectionList(response.data);
    };

    const fetchCollectionEntries = async () => {
        const response = await getCollectionEntries();
        setCollectionEntries(response.data);
    };

    const fetchApprovals = async () => {
        const response = await getApprovals();
        setApprovals(response.data);
    };

    const handleAssignmentChange = (e) => {
        setAssignmentForm({ ...assignmentForm, [e.target.name]: e.target.value });
    };

    const handleAssignmentSubmit = async (e) => {
        e.preventDefault();
        await assignTenant(assignmentForm);
        fetchData();
        setAssignmentForm({ tenant_id: '', property_id: '', tenant_code: '', start_date: '', end_date: '', monthly_rent: '' });
    };

    const handleRentChange = (e) => {
        setRentForm({ ...rentForm, [e.target.name]: e.target.value });
    };

    const handleRentSubmit = async (e) => {
        e.preventDefault();
        await enterRent(rentForm);
        fetchCollectionList();
        setRentForm({ assignment_id: '', amount: '', payment_date: '', due_date: '' });
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
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        {['assigning', 'collection_list', 'rent_entry', 'view', 'collection_entries', 'approvals'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); fetchData(); }}
                                style={{
                                    ...buttonStyle,
                                    background: activeTab === tab ? '#0056b3' : '#007bff',
                                    padding: '8px 15px',
                                }}
                            >
                                {tab.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'assigning' && (
                        <>
                            {/* Bulk Upload Assignments */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Bulk Upload Assignments</h2>
                                <a
                                    href="data:text/csv;charset=utf-8,tenant_id,property_id,tenant_code,start_date,end_date,monthly_rent\n"
                                    download="assignment_template.csv"
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
                                        await bulkUploadAssignments(formData);
                                        fetchData();
                                    }}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Assign Tenant */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Assign Tenant</h2>
                                <form onSubmit={handleAssignmentSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <select name="tenant_id" value={assignmentForm.tenant_id} onChange={handleAssignmentChange} style={inputStyle} required>
                                        <option value="">Select Tenant</option>
                                        {tenants.map(t => (
                                            <option key={t.tenant_id} value={t.tenant_id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <select name="property_id" value={assignmentForm.property_id} onChange={handleAssignmentChange} style={inputStyle} required>
                                        <option value="">Select Property</option>
                                        {properties.map(p => (
                                            <option key={p.property_id} value={p.property_id}>{p.property_code}F{p.flat_number}</option>
                                        ))}
                                    </select>
                                    <input name="tenant_code" value={assignmentForm.tenant_code} onChange={handleAssignmentChange} placeholder="Tenant Code (e.g., MBZ1V4F3R1T1)" style={inputStyle} required />
                                    <input type="date" name="start_date" value={assignmentForm.start_date} onChange={handleAssignmentChange} style={inputStyle} required />
                                    <input type="date" name="end_date" value={assignmentForm.end_date} onChange={handleAssignmentChange} style={inputStyle} required />
                                    <input type="number" name="monthly_rent" value={assignmentForm.monthly_rent} onChange={handleAssignmentChange} placeholder="Monthly Rent" style={inputStyle} required />
                                    <button type="submit" style={{ ...buttonStyle, gridColumn: 'span 2' }}>Assign</button>
                                </form>
                            </div>

                            {/* Assignments List */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Assigned Tenants</h2>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                    <input
                                        placeholder="Search by Tenant Name"
                                        value={search.tenant_name}
                                        onChange={(e) => setSearch({ ...search, tenant_name: e.target.value })}
                                        style={inputStyle}
                                    />
                                    <input
                                        placeholder="Search by Tenant Code"
                                        value={search.tenant_code}
                                        onChange={(e) => setSearch({ ...search, tenant_code: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f0f0f0' }}>
                                            <th style={tableHeaderStyle}>Tenant Name</th>
                                            <th style={tableHeaderStyle}>Tenant Code</th>
                                            <th style={tableHeaderStyle}>Property</th>
                                            <th style={tableHeaderStyle}>Start Date</th>
                                            <th style={tableHeaderStyle}>End Date</th>
                                            <th style={tableHeaderStyle}>Monthly Rent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAssignments.map((a) => (
                                            <tr key={a.assignment_id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={tableCellStyle}>{a.name}</td>
                                                <td style={tableCellStyle}>{a.tenant_code}</td>
                                                <td style={tableCellStyle}>{a.property_code}F{a.flat_number}</td>
                                                <td style={tableCellStyle}>{a.start_date}</td>
                                                <td style={tableCellStyle}>{a.end_date}</td>
                                                <td style={tableCellStyle}>{a.monthly_rent}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'collection_list' && (
                        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Collection List</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f0f0f0' }}>
                                        <th style={tableHeaderStyle}>Tenant Name</th>
                                        <th style={tableHeaderStyle}>Tenant Code</th>
                                        <th style={tableHeaderStyle}>Amount</th>
                                        <th style={tableHeaderStyle}>Due Date</th>
                                        <th style={tableHeaderStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {collectionList.map((payment) => (
                                        <tr key={payment.payment_id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={tableCellStyle}>{payment.name}</td>
                                            <td style={tableCellStyle}>{payment.tenant_code}</td>
                                            <td style={tableCellStyle}>{payment.amount}</td>
                                            <td style={tableCellStyle}>{payment.due_date}</td>
                                            <td style={tableCellStyle}>
                                                <button
                                                    onClick={async () => { await collectPayment(payment.payment_id); fetchCollectionList(); }}
                                                    style={{ ...buttonStyle, padding: '5px 10px' }}
                                                >
                                                    Collect
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'rent_entry' && (
                        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Rent Entry</h2>
                            <form onSubmit={handleRentSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <select name="assignment_id" value={rentForm.assignment_id} onChange={handleRentChange} style={inputStyle} required>
                                    <option value="">Select Assignment</option>
                                    {assignments.map(a => (
                                        <option key={a.assignment_id} value={a.assignment_id}>{a.tenant_code} - {a.name}</option>
                                    ))}
                                </select>
                                <input type="number" name="amount" value={rentForm.amount} onChange={handleRentChange} placeholder="Amount" style={inputStyle} required />
                                <input type="date" name="payment_date" value={rentForm.payment_date} onChange={handleRentChange} style={inputStyle} required />
                                <input type="date" name="due_date" value={rentForm.due_date} onChange={handleRentChange} style={inputStyle} required />
                                <button type="submit" style={{ ...buttonStyle, gridColumn: 'span 2' }}>Enter Rent</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'view' && (
                        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>View All Assignments</h2>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <input
                                    placeholder="Search by Tenant Name"
                                    value={search.tenant_name}
                                    onChange={(e) => setSearch({ ...search, tenant_name: e.target.value })}
                                    style={inputStyle}
                                />
                                <input
                                    placeholder="Search by Tenant Code"
                                    value={search.tenant_code}
                                    onChange={(e) => setSearch({ ...search, tenant_code: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f0f0f0' }}>
                                        <th style={tableHeaderStyle}>Tenant Name</th>
                                        <th style={tableHeaderStyle}>Tenant Code</th>
                                        <th style={tableHeaderStyle}>Property</th>
                                        <th style={tableHeaderStyle}>Start Date</th>
                                        <th style={tableHeaderStyle}>End Date</th>
                                        <th style={tableHeaderStyle}>Monthly Rent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssignments.map((a) => (
                                        <tr key={a.assignment_id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={tableCellStyle}>{a.name}</td>
                                            <td style={tableCellStyle}>{a.tenant_code}</td>
                                            <td style={tableCellStyle}>{a.property_code}F{a.flat_number}</td>
                                            <td style={tableCellStyle}>{a.start_date}</td>
                                            <td style={tableCellStyle}>{a.end_date}</td>
                                            <td style={tableCellStyle}>{a.monthly_rent}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'collection_entries' && (
                        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Collection Entries</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f0f0f0' }}>
                                        <th style={tableHeaderStyle}>Tenant Name</th>
                                        <th style={tableHeaderStyle}>Tenant Code</th>
                                        <th style={tableHeaderStyle}>Amount</th>
                                        <th style={tableHeaderStyle}>Payment Date</th>
                                        <th style={tableHeaderStyle}>Collected At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {collectionEntries.map((entry) => (
                                        <tr key={entry.payment_id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={tableCellStyle}>{entry.name}</td>
                                            <td style={tableCellStyle}>{entry.tenant_code}</td>
                                            <td style={tableCellStyle}>{entry.amount}</td>
                                            <td style={tableCellStyle}>{entry.payment_date}</td>
                                            <td style={tableCellStyle}>{entry.collected_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'approvals' && (
                        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Collection Approvals</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f0f0f0' }}>
                                        <th style={tableHeaderStyle}>Tenant Name</th>
                                        <th style={tableHeaderStyle}>Tenant Code</th>
                                        <th style={tableHeaderStyle}>Amount</th>
                                        <th style={tableHeaderStyle}>Payment Date</th>
                                        <th style={tableHeaderStyle}>Collected At</th>
                                        <th style={tableHeaderStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approvals.map((approval) => (
                                        <tr key={approval.payment_id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={tableCellStyle}>{approval.name}</td>
                                            <td style={tableCellStyle}>{approval.tenant_code}</td>
                                            <td style={tableCellStyle}>{approval.amount}</td>
                                            <td style={tableCellStyle}>{approval.payment_date}</td>
                                            <td style={tableCellStyle}>{approval.collected_at}</td>
                                            <td style={tableCellStyle}>
                                                <button
                                                    onClick={async () => { await approvePayment(approval.payment_id); fetchApprovals(); }}
                                                    style={{ ...buttonStyle, padding: '5px 10px' }}
                                                >
                                                    Approve
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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

export default Rent;
