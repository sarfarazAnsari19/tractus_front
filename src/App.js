import React from 'react';
import ContractList from './components/ContractList';
import ContractUpload from './components/ContractUpload';

const App = () => {
  return (
    <div className="app">
      <header>
        <h1>Contract Management System</h1>
      </header>
      <main>
        <ContractUpload />
        <ContractList />
      </main>
    </div>
  );
};

export default App; 