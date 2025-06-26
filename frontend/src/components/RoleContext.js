import React, { createContext, useContext, useState, useEffect } from 'react';
import { fallbackRoles, getRoleById } from '../data/roles';

// Criar contexto
const RoleContext = createContext();

// Hook personalizado para usar o contexto
export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole deve ser usado dentro de um RoleProvider');
  }
  return context;
};

// Provider do contexto
export const RoleProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar roles do backend ou usar fallback
  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Tentar carregar do backend
      const response = await fetch('http://localhost:5000/roles');
      
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
        console.log('Roles carregadas do backend:', data.roles.length);
      } else {
        // Usar fallback se backend não estiver disponível
        console.warn('Backend não disponível, usando roles de fallback');
        setRoles(fallbackRoles);
      }
    } catch (err) {
      console.warn('Erro ao carregar roles do backend, usando fallback:', err.message);
      setRoles(fallbackRoles);
      setError('Não foi possível carregar as roles do servidor. Usando configuração local.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar roles na inicialização
  useEffect(() => {
    loadRoles();
  }, []);

  // Selecionar role
  const selectRole = (roleId) => {
    const role = roles.find(r => r.id === roleId) || getRoleById(roleId);
    if (role) {
      setSelectedRole(role);
      // Salvar no localStorage para persistência
      localStorage.setItem('selectedRole', JSON.stringify(role));
      console.log('Role selecionada:', role.name);
    } else {
      console.error('Role não encontrada:', roleId);
    }
  };

  // Carregar role salva do localStorage
  const loadSavedRole = () => {
    try {
      const saved = localStorage.getItem('selectedRole');
      if (saved) {
        const role = JSON.parse(saved);
        setSelectedRole(role);
        console.log('Role carregada do localStorage:', role.name);
      }
    } catch (err) {
      console.warn('Erro ao carregar role do localStorage:', err);
    }
  };

  // Carregar role salva quando roles estiverem disponíveis
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      loadSavedRole();
    }
  }, [roles, selectedRole]);

  // Limpar role selecionada
  const clearSelectedRole = () => {
    setSelectedRole(null);
    localStorage.removeItem('selectedRole');
  };

  // Obter role por ID
  const getRole = (roleId) => {
    return roles.find(r => r.id === roleId) || getRoleById(roleId);
  };

  // Verificar se uma role está selecionada
  const isRoleSelected = (roleId) => {
    return selectedRole && selectedRole.id === roleId;
  };

  // Recarregar roles
  const reloadRoles = () => {
    loadRoles();
  };

  // Valor do contexto
  const value = {
    // Estado
    roles,
    selectedRole,
    loading,
    error,
    
    // Ações
    selectRole,
    clearSelectedRole,
    getRole,
    isRoleSelected,
    reloadRoles,
    
    // Utilitários
    hasRoles: roles.length > 0,
    defaultRole: roles.find(r => r.id === 'recruiter') || fallbackRoles[0]
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export default RoleContext; 