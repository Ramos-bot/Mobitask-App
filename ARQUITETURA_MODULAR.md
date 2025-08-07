📁 Mobitask-app/
├── 📁 src/
│   ├── 📁 shared/           # Componentes partilhados
│   │   ├── components/      # UI components reutilizáveis
│   │   ├── navigation/      # Sistema de navegação
│   │   ├── auth/           # Autenticação
│   │   ├── firebase/       # Configuração Firebase
│   │   └── utils/          # Utilities
│   │
│   ├── 📁 mobitaskBase/    # App principal
│   │   ├── Dashboard.js
│   │   ├── ModuleSelector.js
│   │   ├── Settings.js
│   │   └── Profile.js
│   │
│   ├── 📁 mobitaskAqua/    # Módulo Piscinas (atual)
│   │   ├── ...arquivos existentes...
│   │
│   ├── 📁 mobitaskVerde/   # Módulo Jardinagem
│   │   ├── DashboardVerde.js
│   │   ├── GestaoJardins.js
│   │   ├── CalendarioRega.js
│   │   └── CatalogoPlantas.js
│   │
│   └── 📁 mobitaskPhyto/   # Módulo Fitofármacos
│       ├── DashboardPhyto.js
│       ├── GestaoTratamentos.js
│       ├── RegistoAplicacoes.js
│       └── ConformidadeRegulatoria.js
│
├── App.js                  # Entry point principal
├── package.json
└── firebaseConfig.js

## 🎨 FLUXO DE NAVEGAÇÃO PROPOSTO:

1. **Splash Screen** → 
2. **Login/Auth** → 
3. **Mobitask Base Dashboard** → 
4. **Seleção de Módulo** → 
5. **Dashboard do Módulo Específico**
