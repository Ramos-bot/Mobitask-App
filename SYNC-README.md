# 🔄 Sincronização GitHub ↔ Replit

## Configuração Automática

### 📱 Desenvolvimento Local → GitHub → Replit

#### Windows (PowerShell):
```powershell
.\sync.ps1 "Descrição das alterações"
```

#### Linux/Mac/WSL:
```bash
./sync.sh "Descrição das alterações"
```

### 🔗 Configuração no Replit

1. **Import from GitHub:**
   ```
   https://github.com/Ramos-bot/Mobitask-App.git
   ```

2. **Auto-pull:** ✅ ON (importa alterações automaticamente)

3. **Auto-deploy:** ✅ ON (redeploy quando houver alterações)

4. **Deployment Settings:**
   - **Install:** `npm ci`
   - **Build:** `npm run build:web`
   - **Run:** `node server.js`
   - **Health:** `/health`

### 🚀 Fluxo de Trabalho

1. **Desenvolver localmente** no VS Code
2. **Testar:** `npm run dev` (desenvolvimento) ou `npm run build:web && npm start` (produção)
3. **Sincronizar:** `.\sync.ps1 "Nova funcionalidade X"`
4. **Replit importa automaticamente** e faz redeploy

### 🔧 Comandos Úteis

```bash
# Verificar status
git status

# Push manual
git add .
git commit -m "Mensagem"
git push origin main

# Pull no Replit (se auto-pull estiver OFF)
git pull origin main

# Rebuild no Replit
npm run build:web
npm start
```

### 📁 Ficheiros Importantes

- `.replit` - Configuração do Replit
- `Procfile` - Backup de deployment  
- `server.js` - Servidor Express
- `package.json` - Scripts e dependências
- `sync.ps1`/`sync.sh` - Scripts de sincronização
