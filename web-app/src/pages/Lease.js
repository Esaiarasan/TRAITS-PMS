import React, { useState, useEffect } from 'react';
import Menu from '../components/Menu';
import { createOwner, getOwners, getLeases, renewLease, bulkUploadOwners } from '../services/api';

const Lease = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const [owners, setOwners] = useState([]);
    const [leases, setLeases] = useState([]);
    const [filteredOwners, setFilteredOwners] = useState([]);
    const [filteredLeases, setFilteredLeases] = useState([]);
    const [ownerForm, setOwnerForm] = useState({ name: '', mobile_number: '', email: '' });
    const [leaseForm, setLeaseForm] = useState({ owner_id: '', property_code: '', lease_start: '', lease_end: '', monthly_rent: '' });
    const [ownerSearch, setOwnerSearch] = useState('');
    const [leaseSearch, setLeaseSearch] = useState('');

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        setFilteredOwners(owners.filter(o => o.name.toLowerCase().includes(ownerSearch.toLowerCase())));
        setFilteredLeases(leases.filter(l => l.property_code.toLowerCase().includes(leaseSearch.toLowerCase())));
    }, [owners, leases, ownerSearch, leaseSearch]);

    const fetchData = async () => {
        const ownersRes = await getOwners();
        const leasesRes = await Promise.all(ownersRes.data.map(o => getLeases(o.owner_id)));
        setOwners(ownersRes.data);
        setFilteredOwners(ownersRes.data);
        setLeases(leasesRes.flatMap(res => res.data));
        setFilteredLeases(leasesRes.flatMap(res => res.data));
    };

    const handleOwnerChange = (e) => setOwnerForm({ ...ownerForm, [e.target.name]: e.target.value });
    const handleLeaseChange = (e) => setLeaseForm({ ...leaseForm, [e.target.name]: e.target.value });

    const handleOwnerSubmit = async (e) => {
        e.preventDefault();
        await createOwner(ownerForm);
        fetchData();
        setOwnerForm({ name: '', mobile_number: '', email: '' });
    };

    const handleLeaseSubmit = async (e) => {
        e.preventDefault();
        await createOwner(leaseForm); // You probably meant a `createLease` function here!
        fetchData();
        setLeaseForm({ owner_id: '', property_code: '', lease_start: '', lease_end: '', monthly_rent: '' });
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <Menu user={user} />
            <div className="md:ml-[12.5%] w-full md:w-[87.5%]">
                <header className="fixed top-0 md:mt-0 mt-16 left-0 md:left-[12.5%] w-full md:w-[87.5%] bg-white shadow-md flex items-center justify-between p-4 z-10">
                    <img src="/logo.png" alt="Logo" className="w-12" />
                    <h1 className="text-2xl font-bold text-gray-800">TRAITS-PMS</h1>
                    <div className="text-2xl cursor-pointer">🔔</div>
                </header>

                <main className="p-6 mt-20 md:mt-[12.5vh] max-h-[calc(100vh-5rem)] overflow-y-auto">
                    {/* Bulk Upload */}
                    <section className="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Bulk Upload Owners</h2>
                        <a href="data:text/csv;charset=utf-8,name,mobile_number,email\n" download="owner_template.csv" className="text-blue-600 underline mr-4">Download CSV Template</a>
                        <input type="file" accept=".csv" onChange={async (e) => {
                            const formData = new FormData();
                            formData.append('csv_file', e.target.files[0]);
                            await bulkUploadOwners(formData);
                            fetchData();
                        }} className="border p-2 rounded-md w-full md:w-auto" />
                    </section>

                    {/* Owner Form */}
                    <section className="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Owner</h2>
                        <form onSubmit={handleOwnerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="name" value={ownerForm.name} onChange={handleOwnerChange} placeholder="Name" className="border p-3 rounded-md" required />
                            <input name="mobile_number" value={ownerForm.mobile_number} onChange={handleOwnerChange} placeholder="Mobile Number" className="border p-3 rounded-md" />
                            <input name="email" value={ownerForm.email} onChange={handleOwnerChange} placeholder="Email" className="border p-3 rounded-md" />
                            <button type="submit" className="col-span-1 md:col-span-2 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition">Add Owner</button>
                        </form>
                    </section>

                    {/* Owners List */}
                    <section className="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Owners List</h2>
                        <input
                            placeholder="Search by Owner Name"
                            value={ownerSearch}
                            onChange={(e) => setOwnerSearch(e.target.value)}
                            className="border p-3 rounded-md mb-4 w-full"
                        />
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left font-semibold text-gray-700">Name</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Mobile</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOwners.map((owner) => (
                                        <tr key={owner.owner_id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 text-gray-600">{owner.name}</td>
                                            <td className="p-3 text-gray-600">{owner.mobile_number}</td>
                                            <td className="p-3 text-gray-600">{owner.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Lease Form and List */}
                    <section className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Lease</h2>
                        <form onSubmit={handleLeaseSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <select name="owner_id" value={leaseForm.owner_id} onChange={handleLeaseChange} className="border p-3 rounded-md" required>
                                <option value="">Select Owner</option>
                                {owners.map(o => <option key={o.owner_id} value={o.owner_id}>{o.name}</option>)}
                            </select>
                            <input name="property_code" value={leaseForm.property_code} onChange={handleLeaseChange} placeholder="Property Code" className="border p-3 rounded-md" required />
                            <input type="date" name="lease_start" value={leaseForm.lease_start} onChange={handleLeaseChange} className="border p-3 rounded-md" required />
                            <input type="date" name="lease_end" value={leaseForm.lease_end} onChange={handleLeaseChange} className="border p-3 rounded-md" required />
                            <input type="number" name="monthly_rent" value={leaseForm.monthly_rent} onChange={handleLeaseChange} placeholder="Monthly Rent" className="border p-3 rounded-md" required />
                            <button type="submit" className="col-span-1 md:col-span-2 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition">Add Lease</button>
                        </form>
                        <input
                            placeholder="Search by Property Code"
                            value={leaseSearch}
                            onChange={(e) => setLeaseSearch(e.target.value)}
                            className="border p-3 rounded-md mb-4 w-full"
                        />
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left font-semibold text-gray-700">Property Code</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Start Date</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">End Date</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Monthly Rent</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeases.map((lease) => (
                                        <tr key={lease.lease_id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 text-gray-600">{lease.property_code}</td>
                                            <td className="p-3 text-gray-600">{lease.lease_start}</td>
                                            <td className="p-3 text-gray-600">{lease.lease_end}</td>
                                            <td className="p-3 text-gray-600">{lease.monthly_rent}</td>
                                            <td className="p-3 text-gray-600">
                                                <button onClick={async () => { await renewLease(lease.lease_id); fetchData(); }} className="text-blue-600 hover:underline">Renew</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Lease;
