import React, { useState } from 'react';
import axios from 'axios';

const ContractUpload = () => {
  const [file, setFile] = useState(null);
  const [contractData, setContractData] = useState({
    contract_id: '',
    client_name: '',
    content: '',
    status: 'Draft'
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        setContractData({
          ...contractData,
          content
        });
      } catch (error) {
        console.error('Error processing file:', error);
      }
    };

    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/contracts', contractData);
      
      // Reset form
      setContractData({
        contract_id: '',
        client_name: '',
        content: '',
        status: 'Draft'
      });
      setFile(null);
      alert('Contract uploaded successfully!');

    } catch (error) {
      // console.error('Error uploading contract:', error.response.data.error);
      alert('Error uploading contract. Please try again. -> ' + error.response.data.error);
    }
  };

  return (
    <div className="upload-form">
      <h2>Upload Contract</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Contract ID"
          onChange={(e) => setContractData({...contractData, contract_id: e.target.value})}
        />
        <input
          type="text"
          placeholder="Client Name"
          onChange={(e) => setContractData({...contractData, client_name: e.target.value})}
        />
        <input
          type="file"
          accept=".txt,.json"
          onChange={handleFileUpload}
        />
        <button type="submit">Upload Contract</button>
      </form>
    </div>
  );
};

export default ContractUpload; 