import React, { useState } from 'react';
import { maskCPF, maskPhone } from '../utils/masks';
import { UserRegistration } from '../types';
import { ShieldCheck, UserCheck, Lock, Mail, Phone, FileText, User } from 'lucide-react';
import { AuthenticatedUser, loginUser, registerUser } from '../services/api';

interface AuthModalProps {
  onLoginSuccess: (user: AuthenticatedUser) => void;
  currentUser: AuthenticatedUser | null;
  onLogout: () => void;
  onNavigateToCatalog: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onLoginSuccess,
  currentUser,
  onLogout,
  onNavigateToCatalog
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  // Estados do Cadastro
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');

  // Estados do Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manipulador com Máscara de CPF (Padrão 3) e Limite (Padrão 1)
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setCpf(maskCPF(raw));
  };

  // Manipulador com Máscara de Telefone (Padrão 3) e Limite (Padrão 1)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTelefone(maskPhone(raw));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    // Validação de Campos Obrigatórios (Padrão 2)
    if (!nome.trim() || !email.trim() || !cpf.trim() || !telefone.trim() || !senha.trim()) {
      setNotification({
        type: 'error',
        message: 'Preencha todos os campos para continuar.'
      });
      return;
    }

    if (cpf.length < 14) {
      setNotification({
        type: 'error',
        message: 'Confira o CPF informado. Use o formato 000.000.000-00.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await registerUser({ nome: nome.trim(), email: email.trim(), cpf, telefone, senha });
      onLoginSuccess(user);
    } catch (error) {
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível criar a conta.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    // Campos Obrigatórios (Padrão 2)
    if (!loginEmail.trim() || !loginSenha.trim()) {
      setNotification({
        type: 'error',
        message: 'Informe seu e-mail e senha para continuar.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await loginUser(loginEmail.trim(), loginSenha);
      onLoginSuccess(user);
    } catch (error) {
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Não foi possível entrar.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 border border-amber-200/70 shadow-lg text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">
            Olá, {currentUser.nome}!
          </h2>
          <p className="text-stone-600 mb-6 text-sm">
            Você está autenticado com o e-mail: <strong className="text-amber-800">{currentUser.email}</strong>
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onNavigateToCatalog}
              className="px-6 py-2.5 rounded-xl bg-amber-700 text-white font-medium text-sm hover:bg-amber-800 transition-all shadow-xs"
            >
              Ir para o Catálogo de Bolos
            </button>
            <button
              onClick={onLogout}
              className="px-6 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-medium text-sm hover:bg-rose-100 hover:text-rose-700 transition-all"
            >
              Encerrar Sessão
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Abas Alternadoras: Login vs Cadastro */}
      <div className="flex rounded-2xl bg-amber-100/70 p-1.5 border border-amber-200/60 mb-8 max-w-md mx-auto">
        <button
          id="tab-btn-login"
          type="button"
          onClick={() => {
            setIsRegisterMode(false);
            setNotification(null);
          }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            !isRegisterMode
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Entrar na Conta (Login)
        </button>
        <button
          id="tab-btn-register"
          type="button"
          onClick={() => {
            setIsRegisterMode(true);
            setNotification(null);
          }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isRegisterMode
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Criar Nova Conta (Cadastro)
        </button>
      </div>

      {/* Caixa do Formulário */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-200/70 shadow-lg">
        
        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Seus dados são tratados com segurança
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {isRegisterMode ? 'Cadastro de Cliente da Doceria' : 'Acesse sua Conta'}
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {isRegisterMode
              ? 'Preencha seus dados para encomendar os melhores bolos artesanais com segurança.'
              : 'Informe seu e-mail e senha para gerenciar seus pedidos.'}
          </p>
        </div>

        {/* Notificações */}
        {notification && (
          <div
            id="auth-notification"
            className={`p-4 rounded-2xl mb-6 text-sm ${
              notification.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* FORMULÁRIO DE CADASTRO */}
        {isRegisterMode ? (
          <form id="form-cadastro" onSubmit={handleRegister} className="space-y-5">
            
            {/* Campo 1: Nome Completo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="reg-nome" className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-700" />
                  Nome Completo <span className="text-rose-600 font-bold" title="Campo Obrigatório">*</span>
                </label>
                <span className="text-xs text-stone-400 font-mono">
                  {nome.length}/100 caracteres (Limite)
                </span>
              </div>
              <input
                id="reg-nome"
                type="text" // Tipagem de inputs (Padrão 4)
                required // Campos obrigatórios (Padrão 2)
                maxLength={100} // Limite de caracteres (Padrão 1)
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex: Maria Carolina da Silva"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Campo 2: E-mail */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="reg-email" className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-amber-700" />
                  E-mail <span className="text-rose-600 font-bold" title="Campo Obrigatório">*</span>
                </label>
                <span className="text-xs text-stone-400 font-mono">
                  {email.length}/120 caracteres (Limite)
                </span>
              </div>
              <input
                id="reg-email"
                type="email" // Tipagem de inputs (Padrão 4)
                required // Campos obrigatórios (Padrão 2)
                maxLength={120} // Limite de caracteres (Padrão 1)
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Linha dupla: CPF e Telefone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Campo 3: CPF com Máscara */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="reg-cpf" className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-700" />
                    CPF <span className="text-rose-600 font-bold" title="Campo Obrigatório">*</span>
                  </label>
                  <span className="text-xs text-stone-400 font-mono">
                    {cpf.length}/14 máx
                  </span>
                </div>
                <input
                  id="reg-cpf"
                  type="text" // Tipagem de inputs (Padrão 4)
                  required // Campos obrigatórios (Padrão 2)
                  maxLength={14} // Limite de caracteres (Padrão 1)
                  value={cpf}
                  onChange={handleCpfChange} // Máscara de Entrada (Padrão 3)
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-transparent font-mono transition-all"
                />
              </div>

              {/* Campo 4: Telefone com Máscara */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="reg-telefone" className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-amber-700" />
                    Telefone / WhatsApp <span className="text-rose-600 font-bold" title="Campo Obrigatório">*</span>
                  </label>
                  <span className="text-xs text-stone-400 font-mono">
                    {telefone.length}/15 máx
                  </span>
                </div>
                <input
                  id="reg-telefone"
                  type="tel" // Tipagem de inputs (Padrão 4)
                  required // Campos obrigatórios (Padrão 2)
                  maxLength={15} // Limite de caracteres (Padrão 1)
                  value={telefone}
                  onChange={handlePhoneChange} // Máscara de Entrada (Padrão 3)
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-transparent font-mono transition-all"
                />
              </div>

            </div>

            {/* Campo 5: Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="reg-senha" className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-700" />
                  Senha de Acesso <span className="text-rose-600 font-bold" title="Campo Obrigatório">*</span>
                </label>
                <span className="text-xs text-stone-400 font-mono">
                  {senha.length}/60 caracteres (Limite)
                </span>
              </div>
              <input
                id="reg-senha"
                type="password" // Tipagem de inputs (Padrão 4)
                required // Campos obrigatórios (Padrão 2)
                maxLength={60} // Limite de caracteres (Padrão 1)
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Crie uma senha segura"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Botão de Enviar Cadastro */}
            <button
              id="btn-submit-cadastro"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg mt-4"
            >
              {isSubmitting ? 'Criando conta...' : 'Criar Minha Conta'}
            </button>
          </form>
        ) : (
          /* FORMULÁRIO DE LOGIN */
          <form id="form-login" onSubmit={handleLogin} className="space-y-5">
            
            {/* Campo E-mail */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-email" className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-amber-700" />
                  E-mail Cadastrado <span className="text-rose-600 font-bold">*</span>
                </label>
                <span className="text-xs text-stone-400 font-mono">
                  {loginEmail.length}/120 caracteres
                </span>
              </div>
              <input
                id="login-email"
                type="email" // Tipagem (Padrão 4)
                required // Obrigatório (Padrão 2)
                maxLength={120} // Limite (Padrão 1)
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Campo Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-senha" className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-700" />
                  Senha <span className="text-rose-600 font-bold">*</span>
                </label>
                <span className="text-xs text-stone-400 font-mono">
                  {loginSenha.length}/60 caracteres
                </span>
              </div>
              <input
                id="login-senha"
                type="password" // Tipagem (Padrão 4)
                required // Obrigatório (Padrão 2)
                maxLength={60} // Limite (Padrão 1)
                value={loginSenha}
                onChange={e => setLoginSenha(e.target.value)}
                placeholder="Sua senha cadastrada"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Botão de Enviar Login */}
            <button
              id="btn-submit-login"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg mt-4"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar na Minha Conta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
