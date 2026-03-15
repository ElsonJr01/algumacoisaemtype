# RegularizaJá — Backend API

Backend da plataforma de regularização fundiária digital.

## 🚀 Rodar localmente

```bash
npm install
cp .env.example .env
# Preencha as variáveis no .env
npm run dev
```

## 🌐 Deploy no Render

1. Conecte o repositório no **render.com**
2. Escolha **Web Service**
3. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Adicione as variáveis de ambiente (veja `.env.example`)

## 📋 Rotas da API

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/registrar` | Criar conta |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/perfil` | Perfil (auth) |

### Documentos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/documentos/publicos` | Listar documentos públicos |
| GET | `/api/documentos/publicos/:id` | Buscar documento público |
| GET | `/api/documentos/publicos/:id/download` | Download do documento |
| GET | `/api/documentos` | Listar todos (admin) |
| POST | `/api/documentos` | Criar documento (admin) |
| PUT | `/api/documentos/:id` | Atualizar (admin) |
| DELETE | `/api/documentos/:id` | Deletar (admin) |

### Solicitações
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/solicitacoes` | Criar solicitação (público) |
| GET | `/api/solicitacoes/protocolo/:protocolo` | Consultar protocolo (público) |
| GET | `/api/solicitacoes` | Listar (admin) |
| GET | `/api/solicitacoes/:id` | Buscar por ID (admin) |
| PUT | `/api/solicitacoes/:id/status` | Atualizar status (admin) |
| POST | `/api/solicitacoes/:id/converter` | Converter em imóvel (admin) |

### Imóveis
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/imoveis/protocolo/:protocolo` | Rastrear processo (público) |
| GET | `/api/imoveis` | Listar (admin) |
| GET | `/api/imoveis/estatisticas` | Stats (admin) |
| GET | `/api/imoveis/:id` | Buscar (admin) |
| POST | `/api/imoveis` | Criar (admin) |
| PUT | `/api/imoveis/:id/status` | Atualizar status (admin) |
| PUT | `/api/imoveis/:id/engenheiro` | Atribuir engenheiro (admin) |

## 🔧 Variáveis de Ambiente

```env
PORT=3001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=regularizaja
CORS_ORIGIN=https://seu-frontend.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu@gmail.com
EMAIL_PASS=sua_senha_de_app
```

## 🏗️ Arquitetura

```
src/
  dominio/          ← Entidades e interfaces
  servicosTecnicos/ ← MongoDB, Cloudinary, Email
  app/useCases/     ← Lógica de negócio
  ui/               ← Controladores e rotas HTTP
  index.ts          ← Entry point
```

## 🌊 Fluxo de Regularização

```
Solicitação → em_analise → vistoria_agendada 
→ documentacao_pendente → em_aprovacao 
→ aprovado → cartorio → matriculado ✅
```
