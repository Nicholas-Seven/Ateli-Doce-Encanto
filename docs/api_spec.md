# Especificação da API - Doceria de Bolos (Flask + PostgreSQL)

Esta documentação descreve a arquitetura em camadas e a conformidade estrita com os **7 Padrões de Segurança**:

## 🛡️ Os 4 Padrões de Segurança no Front-End:
1. **Limite de Caracteres (`maxLength`):** Aplicado nos inputs para prevenção de estouro de buffer a nível de aplicação.
2. **Campos Obrigatórios (`required`):** Garante dados íntegros e consistentes antes do envio.
3. **Máscaras de Entrada:**
   - **CPF:** `000.000.000-00`
   - **Telefone:** `(00) 00000-0000`
4. **Tipagem de Inputs:**
   - `<input type="email">`
   - `<input type="number">`
   - `<input type="password">`
   - `<input type="text">`

---

## 🛡️ A Tríade CID no Back-End:
5. **Confidencialidade:**
   - O backend nunca vaza chaves de API, variáveis de `.env` ou stacktraces em respostas de erro.
   - Handlers globais de erro retornam mensagens amigáveis e higienizadas.
6. **Integridade:**
   - O backend **recalcula** os preços de todos os itens com base no catálogo oficial do banco de dados.
   - Mesmo que o Front-End envie um preço unitário ou total adulterado, o cálculo do servidor prevalece.
7. **Disponibilidade:**
   - Sistema de rate limiting por IP para proteger o servidor contra sobrecargas e ataques volumétricos.

---

## Endpoints da API:
- `GET /api/produtos` - Retorna catálogo oficial de bolos.
- `POST /api/pedidos/checkout` - Valida integridade e calcula total no servidor.
- `POST /api/auth/cadastro` - Cadastro de clientes com validação.
- `POST /api/auth/login` - Autenticação segura de clientes.
- `GET /api/health` - Status dos padrões de segurança ativos.
