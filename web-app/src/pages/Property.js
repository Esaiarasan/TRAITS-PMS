import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../components/Menu';
import { createProperty, getProperties, getPropertyDetails, bulkUploadProperties, getLeases } from '../services/api';

const Property = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [leases, setLeases] = useState([]);
    const [propertyForm, setPropertyForm] = useState({
        lease_id: '', property_code: '', floor_number: '', flat_number: '', flat_type: '',
        rental_type: 'Flat', num_rooms: '', num_partitions: '', monthly_rent: '',
        occupancy: {},
    });
    const [search, setSearch] = useState({ property_code: '', flat_number: '' });

    useEffect(() => {
        fetchProperties();
        fetchLeases();
    }, []);

    useEffect(() => {
        filterProperties();
    }, [properties, search]);

    const fetchProperties = async () => {
        const response = await getProperties();
        setProperties(response.data);
        setFilteredProperties(response.data);
    };

    const fetchLeases = async () => {
        const ownersResponse = await getOwners();
        let allLeases = [];
        for (const owner of ownersResponse.data) {
            const leasesResponse = await getLeases(owner.owner_id);
            allLeases = [...allLeases, ...leasesResponse.data];
        }
        setLeases(allLeases);
    };

    const filterProperties = () => {
        let result = [...properties];
        if (search.property_code) {
            result = result.filter(p => p.property_code.toLowerCase().includes(search.property_code.toLowerCase()));
        }
        if (search.flat_number) {
            result = result.filter(p => p.flat_number?.toLowerCase().includes(search.flat_number.toLowerCase()));
        }
        setFilteredProperties(result);
    };

    const handlePropertyChange = (e) => {
        const { name, value } = e.target;
        setPropertyForm({ ...propertyForm, [name]: value });
    };

    const handleOccupancyChange = (roomCode, value) => {
        setPropertyForm({
            ...propertyForm,
            occupancy: { ...propertyForm.occupancy, [roomCode]: parseInt(value) || 0 },
        });
    };

    const handlePropertySubmit = async (e) => {
        e.preventDefault();
        await createProperty(propertyForm);
        fetchProperties();
        setPropertyForm({
            lease_id: '', property_code: '', floor_number: '', flat_number: '', flat_type: '',
            rental_type: 'Flat', num_rooms: '', num_partitions: '', monthly_rent: '', occupancy: {},
        });
    };

    const viewPropertyDetails = async (property) => {
        const response = await getPropertyDetails(property.property_id);
        setSelectedProperty(response.data);
    };

    const generateRoomCodes = () => {
        if (propertyForm.rental_type === 'Flat' || !propertyForm.num_rooms) return [];
        const codes = [];
        for (let i = 1; i <= propertyForm.num_rooms; i++) {
            codes.push(`${propertyForm.property_code}F${propertyForm.flat_number}R${i}`);
        }
        return codes;
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
                    {!selectedProperty ? (
                        <>
                            {/* Bulk Upload Properties */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Bulk Upload Properties</h2>
                                <a
                                    href="data:text/csv;charset=utf-8,lease_id,property_code,floor_number,flat_number,flat_type,rental_type,num_rooms,num_partitions,monthly_rent\n"
                                    download="property_template.csv"
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
                                        await bulkUploadProperties(formData);
                                        fetchProperties();
                                    }}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Create Property Section */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Create New Property</h2>
                                <form onSubmit={handlePropertySubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <select name="lease_id" value={propertyForm.lease_id} onChange={handlePropertyChange} style={inputStyle} required>
                                        <option value="">Select Lease</option>
                                        {leases.map(lease => (
                                            <option key={lease.lease_id} value={lease.lease_id}>{lease.property_code}</option>
                                        ))}
                                    </select>
                                    <input name="property_code" value={propertyForm.property_code} onChange={handlePropertyChange} placeholder="Property Code" style={inputStyle} required />
                                    <input type="number" name="floor_number" value={propertyForm.floor_number} onChange={handlePropertyChange} placeholder="Floor Number" style={inputStyle} />
                                    <input name="flat_number" value={propertyForm.flat_number} onChange={handlePropertyChange} placeholder="Flat Number" style={inputStyle} required />
                                    <input name="flat_type" value={propertyForm.flat_type} onChange={handlePropertyChange} placeholder="Flat Type" style={inputStyle} />
                                    <select name="rental_type" value={propertyForm.rental_type} onChange={handlePropertyChange} style={inputStyle}>
                                        <option value="Flat">Flat</option>
                                        <option value="Rooms">Rooms</option>
                                        <option value="Partitions">Partitions</option>
                                        <option value="Multiple Tenancy">Multiple Tenancy</option>
                                    </select>
                                    <input type="number" name="num_rooms" value={propertyForm.num_rooms} onChange={handlePropertyChange} placeholder="Number of Rooms" style={inputStyle} disabled={propertyForm.rental_type === 'Flat'} />
                                    <input type="number" name="num_partitions" value={propertyForm.num_partitions} onChange={handlePropertyChange} placeholder="Number of Partitions" style={inputStyle} disabled={propertyForm.rental_type !== 'Partitions'} />
                                    <input type="number" name="monthly_rent" value={propertyForm.monthly_rent} onChange={handlePropertyChange} placeholder="Monthly Rent" style={inputStyle} required />
                                    {propertyForm.rental_type === 'Multiple Tenancy' && propertyForm.num_rooms && (
                                        <div style={{ gridColumn: 'span 2', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
                                            <h4 style={{ margin: '0 0 10px' }}>Occupancy per Room</h4>
                                            {generateRoomCodes().map(code => (
                                                <div key={code} style={{ marginBottom: '10px' }}>
                                                    <label>{code}: </label>
                                                    <input
                                                        type="number"
                                                        value={propertyForm.occupancy[code] || ''}
                                                        onChange={(e) => handleOccupancyChange(code, e.target.value)}
                                                        style={{ ...inputStyle, width: '60px', marginLeft: '10px' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button type="submit" style={{ ...buttonStyle, gridColumn: 'span 2' }}>Add Property</button>
                                </form>
                            </div>

                            {/* Properties List with Filters */}
                            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>Properties List</h2>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                    <input
                                        placeholder="Search by Property Code"
                                        value={search.property_code}
                                        onChange={(e) => setSearch({ ...search, property_code: e.target.value })}
                                        style={inputStyle}
                                    />
                                    <input
                                        placeholder="Search by Flat Number"
                                        value={search.flat_number}
                                        onChange={(e) => setSearch({ ...search, flat_number: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f0f0f0' }}>
                                            <th style={tableHeaderStyle}>Property Code</th>
                                            <th style={tableHeaderStyle}>Flat Number</th>
                                            <th style={tableHeaderStyle}>Flat Type</th>
                                            <th style={tableHeaderStyle}>Rental Type</th>
                                            <th style={tableHeaderStyle}>Occupancy Status</th>
                                            <th style={tableHeaderStyle}>Availability</th>
                                            <th style={tableHeaderStyle}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProperties.map((property) => (
                                            <tr key={property.property_id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={tableCellStyle}>{property.property_code}</td>
                                                <td style={tableCellStyle}>{property.flat_number}</td>
                                                <td style={tableCellStyle}>{property.flat_type}</td>
                                                <td style={tableCellStyle}>{property.rental_type}</td>
                                                <td style={tableCellStyle}>{property.occupancy_status}</td>
                                                <td style={tableCellStyle}>{property.availability}</td>
                                                <td style={tableCellStyle}>
                                                    <span
                                                        style={{ cursor: 'pointer', color: '#007bff', fontSize: '18px' }}
                                                        onClick={() => viewPropertyDetails(property)}
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
                                <button onClick={() => setSelectedProperty(null)} style={buttonStyle}>Back</button>
                            </div>
                            <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>
                                {selectedProperty.property_code}F{selectedProperty.flat_number} - Details
                            </h2>
                            <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
                                <p><strong>Floor Number:</strong> {selectedProperty.floor_number}</p>
                                <p><strong>Flat Type:</strong> {selectedProperty.flat_type}</p>
                                <p><strong>Rental Type:</strong> {selectedProperty.rental_type}</p>
                                <p><strong>Monthly Rent:</strong> {selectedProperty.monthly_rent}</p>
                                <p><strong>Annual Rent:</strong> {selectedProperty.annual_rent}</p>
                                {selectedProperty.rental_type !== 'Flat' && (
                                    <>
                                        <p><strong>Number of Rooms:</strong> {selectedProperty.num_rooms}</p>
                                        {selectedProperty.rental_type === 'Partitions' && (
                                            <p><strong>Number of Partitions:</strong> {selectedProperty.num_partitions}</p>
                                        )}
                                        {selectedProperty.occupancy && (
                                            <div>
                                                <strong>Occupancy:</strong>
                                                <ul>
                                                    {Object.entries(selectedProperty.occupancy).map(([room, count]) => (
                                                        <li key={room}>{room}: {count} tenants</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )}
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

export default Property;
