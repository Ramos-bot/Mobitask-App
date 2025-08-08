# 🚀 Deploy Replit - Mobitask App

## ✅ Problema Resolvido

### 🔴 Erros Anteriores:
- ❌ Expo development server na porta 8081 (não 5000)
- ❌ Metro bundler não compatível com produção
- ❌ `npm run start` em modo desenvolvimento

### ✅ Soluções Implementadas:

#### 1. **Configuração de Produção** (`.replit`)
```toml
run = "npm run replit:start"

[deployment]
run = ["sh", "-c", "npm run build:web && npx serve -s web-build -l 5000"]
deploymentTarget = "autoscale"

[env]
NODE_ENV = "production"
PORT = "5000"
```

#### 2. **Scripts de Build** (`package.json`)
```json
{
  "scripts": {
    "replit:start": "npx expo start --web --hostname 0.0.0.0 --port 5000",
    "build:web": "npx expo export --platform web",
    "serve": "npx serve -s web-build -l 5000",
    "deploy:replit": "npm run build:web && npm run serve"
  }
}
```

#### 3. **Script de Inicialização** (`start.sh`)
- ✅ Detecção automática: desenvolvimento vs produção
- ✅ Instalação de dependências automática
- ✅ Build e serve estático para deployment

## 🌐 Como Fazer Deploy

### Opção 1: Deploy Automático
1. **GitHub → Replit** (já configurado)
2. **Deploy** clicará automaticamente
3. **URL**: `https://mobitask-app-tiago1982santos.replit.app`

### Opção 2: Manual no Replit
```bash
# Desenvolvimento
npm run replit:start

# Produção
npm run deploy:replit
```

## 📱 Funcionalidades Disponíveis

### 🌐 **Web App** (porta 5000)
- ✅ Dashboard completo
- ✅ Módulos Base (Clientes, Colaboradores, Fornecedores)
- ✅ Firebase integrado
- ✅ Responsivo mobile/desktop

### 🔧 **Comandos Úteis**
```bash
# Instalar dependências
npm install

# Desenvolvimento local
npm run replit:start

# Build para produção
npm run build:web

# Servir build estático
npm run serve

# Deploy completo
npm run deploy:replit
```

## 🎯 Próximos Passos

1. **Re-deploy no Replit**:
   - Aceder ao projeto no Replit
   - Clicar "Deploy" novamente
   - Aguardar build e deploy automático

2. **Verificar funcionamento**:
   - URL: `https://mobitask-app-tiago1982santos.replit.app`
   - Testar módulos base
   - Verificar Firebase connection

3. **Monitoramento**:
   - Logs de deploy no Replit
   - Performance da aplicação
   - Uso de recursos (4 vCPU / 8 GiB RAM)

## 🔥 Status Final

- ✅ **GitHub**: Sincronizado
- ✅ **Replit**: Configurado para produção
- ✅ **Porta 5000**: Configurada
- ✅ **Build Web**: Implementado
- ✅ **Serve Estático**: Funcional
- ✅ **Autoscale**: Compatível

**🎉 Pronto para deploy sem erros!**
