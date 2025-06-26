import React, { useState } from 'react';
import { useRole } from './RoleContext';
import RoleCard from './RoleCard';

const RoleSelector = ({ onRoleSelected, onBack }) => {
  const { roles, loading, error, selectRole, selectedRole, isRoleSelected } = useRole();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleRoleSelect = async (roleId) => {
    setIsSelecting(true);
    
    try {
      selectRole(roleId);
      
      // Simular um pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (onRoleSelected) {
        onRoleSelected(roleId);
      }
    } catch (err) {
      console.error('Erro ao selecionar role:', err);
    } finally {
      setIsSelecting(false);
    }
  };

  const handleContinue = () => {
    if (selectedRole && onRoleSelected) {
      onRoleSelected(selectedRole.id);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Carregando perfis...</h3>
          <p className="text-gray-600">Preparando as opções de interação para você</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-xl mb-6">
            <div className="text-2xl mb-2">⚠️</div>
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
                aria-label="Voltar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Escolha seu Perfil</h1>
                <p className="text-gray-600 mt-1">Selecione como você gostaria de interagir com o assistente</p>
              </div>
            </div>
            
            {selectedRole && (
              <div className="hidden lg:flex items-center space-x-3 bg-blue-50 px-4 py-3 rounded-xl border border-blue-200">
                <span className="text-2xl">{selectedRole.icon}</span>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {selectedRole.name} selecionado
                  </p>
                  <p className="text-xs text-blue-700">{selectedRole.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Mobile selected role indicator */}
        {selectedRole && (
          <div className="lg:hidden mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedRole.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-blue-900">{selectedRole.name}</p>
                  <p className="text-sm text-blue-700">{selectedRole.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid de Roles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {roles.map((role, index) => (
            <div
              key={role.id}
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <RoleCard
                role={role}
                isSelected={isRoleSelected(role.id)}
                onSelect={handleRoleSelect}
                disabled={isSelecting}
              />
            </div>
          ))}
        </div>

        {/* Botão de Continuar */}
        {selectedRole && (
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={isSelecting}
              className={`
                inline-flex items-center px-8 py-4 rounded-xl font-medium text-white transition-all duration-300 transform
                ${isSelecting 
                  ? 'bg-gray-400 cursor-not-allowed scale-95' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg hover:shadow-xl active:scale-95'
                }
              `}
              style={{
                backgroundColor: isSelecting ? undefined : selectedRole.color
              }}
            >
              {isSelecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span>Carregando...</span>
                </>
              ) : (
                <>
                  <span className="mr-2">Continuar como</span>
                  <span className="text-xl mr-2">{selectedRole.icon}</span>
                  <span>{selectedRole.name}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Informações adicionais */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 max-w-2xl mx-auto">
            <div className="text-2xl mb-3">💡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dica</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Você pode trocar de perfil a qualquer momento durante a conversa. 
              Cada perfil oferece uma experiência personalizada baseada no seu contexto.
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default RoleSelector; 