import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ContractList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState({
    contract_id: '',
    client_name: '',
    status: '',
    content: ''
  });
  const [contracts, setContracts] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    client_name: '',
    contract_id: '',
    page: 1
  });
  const wsRef = useRef(null);

  // First useEffect to initialize WebSocket
  useEffect(() => {
    // Close the WebSocket connection if it already exists
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Initialize WebSocket connection
    wsRef.current = new WebSocket('ws://localhost:5000');
    
    const handleWebSocketMessage = (event) => {
      const { type, data } = JSON.parse(event.data);

      switch (type) {
        case 'CONTRACT_CREATED':
          setContracts(prev => [data, ...prev]);
          break;
        case 'CONTRACT_UPDATED':
          setContracts(prev => 
            prev.map(contract => contract.id === data.id ? data : contract)
          );
          break;
        case 'CONTRACT_DELETED':
          setContracts(prev => 
            prev.filter(contract => contract.id !== data.id)
          );
          break;
        default:
          break;
      }
    };

    wsRef.current.onmessage = handleWebSocketMessage;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [contracts]);

  // Second useEffect to handle filter changes
  useEffect(() => {
    fetchContracts();
  }, [filters]);

  const fetchContracts = async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/api/contracts?${params}`);
      setContracts(response.data.contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  const handleEdit = async (contract_id) => {
    try {
      const response = await axios.get(`/api/contracts/${contract_id}`);
      setEditingContract(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching contract details:', error);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/contracts/${editingContract.id}`, editingContract);
      setIsModalOpen(false);
 
    } catch (error) {
      console.error('Error updating contract:', error);
    }
  };

  const handleModalChange = (e) => {
    setEditingContract({
      ...editingContract,
      [e.target.name]: e.target.value
    });
  };

  const handleDelete = async (contract_id) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        await axios.delete(`/api/contracts/${contract_id}`);
        // No need to manually update the contracts state
        // The WebSocket connection will handle the update
      } catch (error) {
        console.error('Error deleting contract:', error);
      }
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1
    });
  };

  return (
    <div className="container">
      <div className="filters">
        <input
          type="text"
          name="client_name"
          placeholder="Search by client name"
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="contract_id"
          placeholder="Search by contract ID"
          onChange={handleFilterChange}
        />
        <select name="status" onChange={handleFilterChange}>
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Finalized">Finalized</option>
        </select>
      </div>

      <table className="contracts-table">
        <thead>
          <tr>
            <th>Contract ID</th>
            <th>Client Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => (
            <tr key={contract.id}>
              <td>{contract.contract_id}</td>
              <td>{contract.client_name}</td>
              <td>{contract.status}</td>
              <td>
                <button className="edit-button" onClick={() => handleEdit(contract.id)}>Edit</button>
                <button className="delete-button" onClick={() => handleDelete(contract.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Contract</h2>
            <form onSubmit={handleModalSubmit}>
              <div>
                <label>Contract ID:</label>
                <input
                  type="text"
                  name="contract_id"
                  value={editingContract.contract_id}
                  onChange={handleModalChange}
                />
              </div>
              <div>
                <label>Client Name:</label>
                <input
                  type="text"
                  name="client_name"
                  value={editingContract.client_name}
                  onChange={handleModalChange}
                />
              </div>
              <div>
                <label>Status:</label>
                <select
                  name="status"
                  value={editingContract.status}
                  onChange={handleModalChange}
                >
                  <option value="Draft">Draft</option>
                  <option value="Finalized">Finalized</option>
                </select>
              </div>
              <div>
                <label>Content:</label>
                <textarea
                  name="content"
                  value={editingContract.content}
                  onChange={handleModalChange}
                  rows="4"
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Save Changes</button>
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractList;