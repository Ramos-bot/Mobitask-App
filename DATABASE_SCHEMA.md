# 🗄️ ESTRUTURA DE BASE DE DADOS INTEGRADA - MOBITASK

## 📋 COLEÇÕES PRINCIPAIS

### 🏢 **companies**
```javascript
{
  id: "company_123",
  name: "AquaVerde Services",
  email: "info@aquaverde.pt",
  phone: "+351 XXX XXX XXX",
  address: {
    street: "Rua das Flores, 123",
    city: "Lisboa",
    postalCode: "1000-000",
    country: "Portugal"
  },
  subscription: {
    plan: "premium", // basic, premium, enterprise
    modules: ["aqua", "verde", "phyto"],
    expiryDate: "2025-12-31",
    paymentStatus: "active"
  },
  settings: {
    timezone: "Europe/Lisbon",
    currency: "EUR",
    language: "pt"
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 👥 **users**
```javascript
{
  id: "user_456",
  companyId: "company_123",
  email: "tecnico@aquaverde.pt",
  displayName: "João Silva",
  role: "technician", // admin, manager, technician, client
  permissions: {
    aqua: ["read", "write", "delete"],
    verde: ["read", "write"],
    phyto: ["read"]
  },
  profile: {
    phone: "+351 XXX XXX XXX",
    avatar: "https://...",
    bio: "Técnico especializado em piscinas",
    certifications: ["pool_maintenance", "water_analysis"]
  },
  preferences: {
    notifications: true,
    language: "pt",
    theme: "light"
  },
  lastLogin: Timestamp,
  createdAt: Timestamp
}
```

### 🏠 **clients**
```javascript
{
  id: "client_789",
  companyId: "company_123",
  personalInfo: {
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "+351 XXX XXX XXX",
    nif: "123456789"
  },
  address: {
    street: "Rua Principal, 45",
    city: "Porto",
    postalCode: "4000-000",
    coordinates: {
      lat: 41.1579,
      lng: -8.6291
    }
  },
  services: {
    aqua: {
      active: true,
      startDate: "2024-01-15",
      contractType: "monthly", // weekly, monthly, seasonal
      pools: ["pool_001", "pool_002"]
    },
    verde: {
      active: true,
      startDate: "2024-03-01",
      contractType: "seasonal",
      gardens: ["garden_001"]
    },
    phyto: {
      active: false,
      crops: []
    }
  },
  billing: {
    preferredMethod: "bank_transfer",
    billingAddress: { /* igual ao address ou diferente */ },
    invoiceEmail: "contabilidade@maria.com"
  },
  notes: "Cliente VIP - Atenção especial",
  status: "active", // active, inactive, suspended
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 🏊 **pools** (Módulo Aqua)
```javascript
{
  id: "pool_001",
  clientId: "client_789",
  companyId: "company_123",
  basicInfo: {
    name: "Piscina Principal",
    type: "residential", // residential, commercial, olympic
    shape: "rectangular",
    volume: 45, // m³
    depth: {
      shallow: 1.2,
      deep: 2.0
    }
  },
  equipment: {
    filtration: {
      type: "sand",
      brand: "Pentair",
      model: "Sand Dollar",
      installDate: "2023-05-15"
    },
    heating: {
      type: "heat_pump",
      brand: "Zodiac",
      targetTemp: 26
    },
    automation: {
      hasController: true,
      brand: "Hayward",
      model: "AquaRite"
    }
  },
  maintenance: {
    frequency: "weekly",
    lastService: "2025-01-20",
    nextService: "2025-01-27",
    assignedTechnician: "user_456"
  },
  location: {
    indoorOutdoor: "outdoor",
    exposure: "full_sun", // full_sun, partial_shade, full_shade
    nearbyVegetation: true
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 🌳 **gardens** (Módulo Verde)
```javascript
{
  id: "garden_001",
  clientId: "client_789",
  companyId: "company_123",
  basicInfo: {
    name: "Jardim Frontal",
    area: 120, // m²
    style: "mediterranean", // mediterranean, contemporary, english, etc
    soilType: "clay_loam"
  },
  irrigation: {
    system: "drip", // drip, sprinkler, manual
    zones: [
      {
        name: "Zona A - Relvado",
        area: 60,
        plantTypes: ["grass"],
        schedule: "daily_6am"
      },
      {
        name: "Zona B - Arbustos",
        area: 40,
        plantTypes: ["shrubs", "perennials"],
        schedule: "alternate_days_7am"
      }
    ],
    controller: {
      brand: "Rain Bird",
      model: "ESP-Me",
      zones: 6
    }
  },
  plants: [
    {
      species: "Olea europaea",
      commonName: "Oliveira",
      quantity: 3,
      plantingDate: "2023-10-15",
      location: "zona_central"
    }
  ],
  maintenance: {
    frequency: "biweekly",
    lastService: "2025-01-15",
    nextService: "2025-01-29",
    assignedTechnician: "user_789"
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 🌾 **crops** (Módulo Phyto)
```javascript
{
  id: "crop_001",
  clientId: "client_789",
  companyId: "company_123",
  basicInfo: {
    name: "Vinha Norte",
    area: 2.5, // hectares
    cropType: "vineyard",
    variety: "Touriga Nacional",
    plantingYear: 2020
  },
  location: {
    coordinates: {
      lat: 41.1579,
      lng: -8.6291
    },
    altitude: 150,
    slope: "south_facing",
    soilAnalysis: {
      ph: 6.5,
      organicMatter: 2.8,
      nitrogen: "medium",
      phosphorus: "high",
      potassium: "medium"
    }
  },
  treatments: {
    currentSeason: "2024/2025",
    lastApplication: "2024-12-15",
    nextPlanned: "2025-02-01"
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 🧪 **analyses** (Cross-module)
```javascript
{
  id: "analysis_001",
  companyId: "company_123",
  type: "water", // water, soil, plant_tissue
  module: "aqua", // aqua, verde, phyto
  
  // Referências dinâmicas baseadas no módulo
  targetId: "pool_001", // pool_id, garden_id, crop_id
  targetType: "pool", // pool, garden, crop
  clientId: "client_789",
  
  sampleInfo: {
    collectionDate: Timestamp,
    collectionTime: "10:30",
    weather: "sunny",
    temperature: 24,
    technicianId: "user_456"
  },
  
  parameters: {
    // Para Aqua (água de piscina)
    chlorine: { value: 1.2, unit: "ppm", ideal: "1.0-3.0" },
    ph: { value: 7.4, unit: "", ideal: "7.2-7.6" },
    alkalinity: { value: 120, unit: "ppm", ideal: "80-120" },
    
    // Para Verde (solo)
    soilPh: { value: 6.8, unit: "", ideal: "6.0-7.5" },
    organicMatter: { value: 3.2, unit: "%", ideal: ">2.0" },
    
    // Para Phyto (análise foliar)
    nitrogen: { value: 2.8, unit: "%", ideal: "2.5-3.5" }
  },
  
  results: {
    status: "good", // excellent, good, warning, critical
    recommendations: [
      "Manter níveis atuais de cloro",
      "Verificar sistema de dosagem em 3 dias"
    ],
    nextAnalysis: "2025-02-10"
  },
  
  images: ["analysis_img_001.jpg", "analysis_img_002.jpg"],
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 📋 **tasks** (Cross-module)
```javascript
{
  id: "task_001",
  companyId: "company_123",
  module: "aqua", // aqua, verde, phyto
  type: "maintenance", // maintenance, analysis, treatment, emergency
  
  basicInfo: {
    title: "Limpeza semanal piscina",
    description: "Aspiração, escovagem e verificação equipamentos",
    priority: "medium", // low, medium, high, urgent
    status: "pending" // pending, in_progress, completed, cancelled
  },
  
  assignment: {
    clientId: "client_789",
    targetId: "pool_001", // pool_id, garden_id, crop_id
    targetType: "pool",
    technicianId: "user_456",
    estimatedDuration: 120 // minutos
  },
  
  scheduling: {
    scheduledDate: "2025-01-27",
    scheduledTime: "09:00",
    completedDate: null,
    completedTime: null
  },
  
  materials: [
    { name: "Cloro granulado", quantity: 0.5, unit: "kg" },
    { name: "Redutor pH", quantity: 0.2, unit: "l" }
  ],
  
  results: {
    workDone: [],
    timeSpent: 0,
    photos: [],
    clientSignature: null,
    notes: ""
  },
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 💰 **invoicing** (Cross-module)
```javascript
{
  id: "invoice_001",
  companyId: "company_123",
  clientId: "client_789",
  
  billing: {
    invoiceNumber: "2025-001",
    issueDate: "2025-01-31",
    dueDate: "2025-02-15",
    period: {
      from: "2025-01-01",
      to: "2025-01-31"
    }
  },
  
  services: [
    {
      module: "aqua",
      description: "Manutenção mensal piscina",
      quantity: 4,
      unit: "visitas",
      unitPrice: 45.00,
      total: 180.00
    },
    {
      module: "verde",
      description: "Manutenção jardim",
      quantity: 2,
      unit: "visitas",
      unitPrice: 65.00,
      total: 130.00
    }
  ],
  
  totals: {
    subtotal: 310.00,
    tax: 71.30, // 23% IVA
    total: 381.30
  },
  
  status: "sent", // draft, sent, paid, overdue, cancelled
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```
