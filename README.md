# 🏢 MobiTask - Plataforma de Gestão Profissional

Uma plataforma modular de gestão empresarial desenvolvida em React Native/Expo, projetada para diferentes setores de negócio.

## 📱 Módulos Disponíveis

### 🏊‍♂️ MobiTask Aqua
Sistema completo de gestão de piscinas e tratamento de água
- Monitoramento de qualidade da água
- Gestão de clientes e serviços
- Análise por imagem
- Relatórios automáticos

### 🌾 MobiTask Farm (Em Desenvolvimento)
Gestão agrícola e monitoramento de cultivos

### 🧽 MobiTask Clean (Em Desenvolvimento)
Gestão de serviços de limpeza e manutenção

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Expo CLI
- Conta Firebase configurada

### Instalação
```bash
# 1. Clonar o repositório
git clone https://github.com/Ramos-bot/Mobitask-App.git
cd Mobitask-App

# 2. Instalar dependências
npm install

# 3. Configurar Firebase
# Copie suas credenciais para firebaseConfig.js

# 4. Executar a aplicação
npx expo start
```

### Teste em Dispositivo
1. Instale o app **Expo Go** no seu dispositivo
2. Escaneie o QR code que aparece no terminal
3. A aplicação será carregada no seu dispositivo

## 🏗️ Arquitetura

```
src/
├── shared/           # Componentes compartilhados
│   ├── components/   # LoginScreen, SplashScreen
│   └── services/     # DataManager, utilitários
├── core/            # Funcionalidades centrais
│   └── licensing/   # Sistema de licenciamento
├── mobitaskBase/    # Módulo base da plataforma
└── config/          # Configurações dos módulos
```

## 🔧 Tecnologias Utilizadas

- **React Native** - Framework mobile
- **Expo** - Desenvolvimento e deployment
- **Firebase** - Backend e autenticação
- **AsyncStorage** - Armazenamento local
- **React Navigation** - Navegação
- **Linear Gradient** - Interfaces modernas

## 📊 Funcionalidades Principais

### Autenticação
- Login com email/senha
- Modo demonstração
- Recuperação de senha
- Integração Firebase Auth

### Sistema Modular
- Seletor de módulos dinâmico
- Sistema de licenciamento
- Diferentes planos de assinatura

### Interface
- Design responsivo
- Tema profissional
- Navegação intuitiva
- Componentes reutilizáveis

## 🔐 Configuração Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Configure Authentication (Email/Password)
3. Configure Firestore Database
4. Baixe o arquivo de configuração
5. Atualize `firebaseConfig.js` com suas credenciais

## 📱 Planos de Assinatura

| Plano | Módulos Incluídos | Preço |
|-------|------------------|-------|
| **Basic** | MobiTask Aqua | Gratuito |
| **Pro** | Aqua + Farm | €29/mês |
| **Premium** | Todos os módulos | €49/mês |

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Faça commit das mudanças (`git commit -m 'Adicionar MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Changelog

### v1.0.0 (2025-08-06)
- ✅ Sistema de autenticação Firebase
- ✅ Módulo MobiTask Aqua completo
- ✅ Sistema de licenciamento
- ✅ Seletor de módulos dinâmico
- ✅ Interface responsiva e profissional

## 📧 Contato

- **Desenvolvedor**: Ramos
- **Email**: [seu-email@exemplo.com]
- **GitHub**: [@Ramos-bot](https://github.com/Ramos-bot)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela no GitHub!**
