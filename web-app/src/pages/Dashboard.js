import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../components/Menu';
import { getDashboardData } from '../services/api';

const Dashboard = () => {
    const navigate = useNavigate();

    // ✅ Safely parse user from localStorage
    let user = {};
    try {
        const storedUser = localStorage.getItem('user');
        user = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : {};
    } catch (err) {
        console.error("Invalid user JSON in localStorage:", err);
    }

    const [data, setData] = useState({
        metrics: {},
        recent_leases: [],
        rent_status: [],
        cheque_status: [],
    });

    const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
    const [leasePage, setLeasePage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchDashboardData();
    }, [monthFilter]);

    const fetchDashboardData = async () => {
        try {
            const response = await getDashboardData(monthFilter);
            setData({
                metrics: response?.data?.metrics || {},
                recent_leases: response?.data?.recent_leases || [],
                rent_status: response?.data?.rent_status || [],
                cheque_status: response?.data?.cheque_status || [],
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const paginate = (array, page) => {
        const start = (page - 1) * itemsPerPage;
        return array.slice(start, start + itemsPerPage);
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <Menu user={user} />
            <div className="md:ml-[12.5%] w-full md:w-[87.5%]">
                <header className="fixed top-0 md:mt-0 mt-16 left-0 md:left-[12.5%] w-full md:w-[87.5%] bg-white shadow-md flex items-center justify-between p-4 z-10">
                    <img src="/logo.png" alt="Logo" className="w-12" />
                    <h1 className="text-2xl font-bold text-gray-800">TRAITS-PMS</h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-2xl cursor-pointer">🔔</div>
                        <button onClick={handleLogout} className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition">Logout</button>
                    </div>
                </header>

                <main className="p-6 mt-20 md:mt-[12.5vh] max-h-[calc(100vh-5rem)] overflow-y-auto">
                    <div className="mb-6 flex justify-end">
                        <input
                            type="month"
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="border p-2 rounded-md"
                        />
                    </div>

                    {/* Metrics Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {[
                            { label: "Total Owners", value: data.metrics.total_owners || 0, color: "blue" },
                            { label: "Total Leases", value: data.metrics.total_leases || 0, color: "green" },
                            { label: "Total Properties", value: data.metrics.total_properties || 0, color: "purple" },
                            { label: "Total Tenants", value: data.metrics.total_tenants || 0, color: "yellow" },
                            { label: `Rent Due (${monthFilter})`, value: `AED ${data.metrics.rent_due || 0}`, color: "red" },
                            { label: `Cheques Pending (${monthFilter})`, value: data.metrics.cheques_pending || 0, color: "orange" },
                        ].map((item, idx) => (
                            <div key={idx} className={`bg-white p-6 rounded-lg shadow-sm border-l-4 border-${item.color}-500`}>
                                <h3 className="text-lg font-semibold text-gray-700">{item.label}</h3>
                                <p className="text-3xl font-bold text-gray-800">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Recent Leases */}
                    <section className="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Leases</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left font-semibold text-gray-700">Property Code</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Owner</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Start Date</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">End Date</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Monthly Rent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginate(data.recent_leases, leasePage).map((lease) => (
                                        <tr key={lease.lease_id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/lease')}>
                                            <td className="p-3 text-gray-600">{lease.property_code}</td>
                                            <td className="p-3 text-gray-600">{lease.name}</td>
                                            <td className="p-3 text-gray-600">{lease.lease_start}</td>
                                            <td className="p-3 text-gray-600">{lease.lease_end}</td>
                                            <td className="p-3 text-gray-600">{lease.monthly_rent}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => setLeasePage(p => Math.max(1, p - 1))}
                                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                disabled={leasePage === 1}
                            >
                                Previous
                            </button>
                            <span>Page {leasePage} of {Math.ceil(data.recent_leases.length / itemsPerPage)}</span>
                            <button
                                onClick={() => setLeasePage(p => Math.min(Math.ceil(data.recent_leases.length / itemsPerPage), p + 1))}
                                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                disabled={leasePage === Math.ceil(data.recent_leases.length / itemsPerPage)}
                            >
                                Next
                            </button>
                        </div>
                    </section>

                    {/* Rent Status */}
                    <section className="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Rent Collection Status ({monthFilter})</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['pending', 'collected', 'approved'].map(status => {
                                const stat = Array.isArray(data.rent_status) ? data.rent_status.find(s => s.status === status) : null;
                                return (
                                    <div key={status} className={`p-4 rounded-md ${status === 'pending' ? 'bg-red-100' : status === 'collected' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                                        <h3 className="text-lg font-semibold capitalize">{status}</h3>
                                        <p className="text-2xl font-bold">AED {stat?.total || 0}</p>
                                        <p>{stat?.count || 0} Payments</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Cheque Status */}
                    <section className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Cheque Status ({monthFilter})</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['pending', 'cleared', 'returned'].map(status => {
                                const stat = Array.isArray(data.cheque_status) ? data.cheque_status.find(s => s.status === status) : null;
                                return (
                                    <div key={status} className={`p-4 rounded-md ${status === 'pending' ? 'bg-orange-100' : status === 'cleared' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <h3 className="text-lg font-semibold capitalize">{status}</h3>
                                        <p className="text-2xl font-bold">{stat?.count || 0}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
