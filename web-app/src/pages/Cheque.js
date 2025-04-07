import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../components/Menu';
import { addCheque, getCheques, getChequeDetails, bulkUploadCheques, updateChequeStatus, getCollectionEntries } from '../services/api';

const Cheque = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const navigate = useNavigate();
    const [cheques, setCheques] = useState([]);
    const [filteredCheques, setFilteredCheques] = useState([]);
    const [selectedCheque, setSelectedCheque] = useState(null);
    const [payments, setPayments] = useState([]);
    const [chequeForm, setChequeForm] = useState({
        payment_id: '', cheque_number: '', bank_name: '', amount: '', date_issued: '', due_date: '', issued_to: '', issued_by: '',
    });
    const [search, setSearch] = useState({ cheque_number: '', bank_name: '' });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterCheques();
    }, [cheques, search]);

    const fetchData = async () => {
        const [chequesRes, paymentsRes] = await Promise.all([
            getCheques(),
            getCollectionEntries(), // Fetch collected payments for linking
        ]);
        setCheques(chequesRes.data);
        setFilteredCheques(chequesRes.data);
        setPayments(paymentsRes.data);
    };

    const filterCheques = () => {
        let result = [...cheques];
        if (search.cheque_number) {
            result = result.filter(c => c.cheque_number.toLowerCase().includes(search.cheque_number.toLowerCase()));
        }
        if (search.bank_name) {
            result = result.filter(c => c.bank_name.toLowerCase().includes(search.bank_name.toLowerCase()));
        }
        setFilteredCheques(result);
    };

    const handleChequeChange = (e) => {
        setChequeForm({ ...chequeForm, [e.target.name]: e.target.value });
    };

    const handleChequeSubmit = async (e) => {
        e.preventDefault();
        await addCheque(chequeForm);
        fetchData();
        setChequeForm({
            payment_id: '', cheque_number: '', bank_name: '', amount: '', date_issued: '', due_date: '', issued_to: '', issued_by: '',
        });
    };

    const viewChequeDetails = async (cheque) => {
        const response = await getChequeDetails(cheque.cheque_id);
        setSelectedCheque(response.data);
    };

    const handleStatusUpdate = async (chequeId, status) => {
        await updateChequeStatus(chequeId, status);
        fetchData();
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
                    {!selectedCheque ? (
                        <>
                            {/* Bulk Upload Cheques */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Bulk Upload Cheques</h2>
                                <a
                                    href="data:text/csv;charset=utf-8,payment_id,cheque_number,bank_name,amount,date_issued,due_date,issued_to,issued_by\n"
                                    download="cheque_template.csv"
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
                                        await bulkUploadCheques(formData);
                                        fetchData();
                                    }}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Add Cheque Section */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Add New Cheque</h2>
                                <form onSubmit={handleChequeSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <select name="payment_id" value={chequeForm.payment_id} onChange={handleChequeChange} style={inputStyle} required>
                                        <option value="">Select Payment</option>
                                        {payments.map(p => (
                                            <option key={p.payment_id} value={p.payment_id}>{p.tenant_code} - {p.amount}</option>
                                        ))}
                                    </select>
                                    <input name="cheque_number" value={chequeForm.cheque_number} onChange={handleChequeChange} placeholder="Cheque Number" style={inputStyle} required />
                                    <input name="bank_name" value={chequeForm.bank_name} onChange={handleChequeChange} placeholder="Bank Name" style={inputStyle} required />
                                    <input type="number" name="amount" value={chequeForm.amount} onChange={handleChequeChange} placeholder="Amount" style={inputStyle} required />
                                    <input type="date" name="date_issued" value={chequeForm.date_issued} onChange={handleChequeChange} style={inputStyle} required />
                                    <input type="date" name="due_date" value={chequeForm.due_date} onChange={handleChequeChange} style={inputStyle} required />
                                    <input name="issued_to" value={chequeForm.issued_to} onChange={handleChequeChange} placeholder="Issued To" style={inputStyle} required />
                                    <input name="issued_by" value={chequeForm.issued_by} onChange={handleChequeChange} placeholder="Issued By" style={inputStyle} required />
                                    <button type="submit" style={{ ...buttonStyle, gridColumn: 'span 2' }}>Add Cheque</button>
                                </form>
                            </div>

                            {/* Cheques List with Filters */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Cheques List</h2>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                    <input
                                        placeholder="Search by Cheque Number"
                                        value={search.cheque_number}
                                        onChange={(e) => setSearch({ ...search, cheque_number: e.target.value })}
                                        style={inputStyle}
                                    />
                                    <input
                                        placeholder="Search by Bank Name"
                                        value={search.bank_name}
                                        onChange={(e) => setSearch({ ...search, bank_name: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f0f0f0' }}>
                                            <th style={tableHeaderStyle}>Cheque Number</th>
                                            <th style={tableHeaderStyle}>Bank Name</th>
                                            <th style={tableHeaderStyle}>Amount</th>
                                            <th style={tableHeaderStyle}>Due Date</th>
                                            <th style={tableHeaderStyle}>Status</th>
                                            <th style={tableHeaderStyle}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCheques.map((cheque) => (
                                            <tr key={cheque.cheque_id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={tableCellStyle}>{cheque.cheque_number}</td>
                                                <td style={tableCellStyle}>{cheque.bank_name}</td>
                                                <td style={tableCellStyle}>{cheque.amount}</td>
                                                <td style={tableCellStyle}>{cheque.due_date}</td>
                                                <td style={tableCellStyle}>{cheque.status}</td>
                                                <td style={tableCellStyle}>
                                                    <span
                                                        style={{ cursor: 'pointer', color: '#007bff', fontSize: '18px', marginRight: '10px' }}
                                                        onClick={() => viewChequeDetails(cheque)}
                                                    >
                                                        👁️
                                                    </span>
                                                    {cheque.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(cheque.cheque_id, 'cleared')}
                                                                style={{ ...buttonStyle, padding: '5px 10px', marginRight: '5px' }}
                                                            >
                                                                Clear
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(cheque.cheque_id, 'returned')}
                                                                style={{ ...buttonStyle, padding: '5px 10px', background: '#dc3545' }}
                                                            >
                                                                Return
                                                            </button>
                                                        </>
                                                    )}
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
                                <button onClick={() => setSelectedCheque(null)} style={buttonStyle}>Back</button>
                            </div>
                            <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>{selectedCheque.cheque_number} - Details</h2>
                            <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
                                <p><strong>Payment ID:</strong> {selectedCheque.payment_id}</p>
                                <p><strong>Tenant:</strong> {selectedCheque.name} ({selectedCheque.tenant_code})</p>
                                <p><strong>Bank Name:</strong> {selectedCheque.bank_name}</p>
                                <p><strong>Amount:</strong> {selectedCheque.amount}</p>
                                <p><strong>Date Issued:</strong> {selectedCheque.date_issued}</p>
                                <p><strong>Due Date:</strong> {selectedCheque.due_date}</p>
                                <p><strong>Issued To:</strong> {selectedCheque.issued_to}</p>
                                <p><strong>Issued By:</strong> {selectedCheque.issued_by}</p>
                                <p><strong>Status:</strong> {selectedCheque.status}</p>
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

export default Cheque;
