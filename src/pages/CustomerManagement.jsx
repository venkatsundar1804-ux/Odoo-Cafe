import { useEffect, useState } from 'react';
import { useCustomerStore } from '../store/customerStore';

export default function CustomerManagement() {
  const { customers, fetchCustomers, addCustomer, isLoading } = useCustomerStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCustomer(formData);
      setFormData({ name: '', email: '', phone_number: '' }); // reset form
    } catch (error) {
      alert("Failed to add customer. Check console.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Customer Management</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>Add New Customer</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label>Name: </label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Email: </label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Phone: </label>
            <input 
              type="tel" 
              name="phone_number" 
              value={formData.phone_number} 
              onChange={handleInputChange} 
            />
          </div>
          <button type="submit">Add Customer</button>
        </form>
      </section>

      <section>
        <h2>Existing Customers</h2>
        {isLoading ? (
          <p>Loading customers...</p>
        ) : (
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Loyalty Points</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr key={cust.id}>
                  <td>{cust.id}</td>
                  <td>{cust.name}</td>
                  <td>{cust.email}</td>
                  <td>{cust.phone_number}</td>
                  <td>{cust.loyalty_points || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
