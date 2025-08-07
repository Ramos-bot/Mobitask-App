// Configuração de módulos comerciais
export const MODULE_CONFIG = {
    aqua: {
        id: 'aqua',
        name: 'Mobitask Aqua',
        icon: '💧',
        color: '#1e88e5',
        price: 39,
        currency: 'EUR',
        billing: 'monthly',
        description: 'Gestão profissional de piscinas e análise de água',
        features: [
            'Análise de água por imagem',
            'Gestão completa de piscinas',
            'Alertas automáticos de qualidade',
            'Relatórios especializados',
            'Histórico de tratamentos',
            'Agendamento de manutenção'
        ],
        limits: {
            pools: 100,
            analyses: 'unlimited',
            clients: 'unlimited'
        },
        requiredPermissions: ['pools_management', 'water_analysis'],
        category: 'maintenance'
    },

    verde: {
        id: 'verde',
        name: 'Mobitask Verde',
        icon: '🌱',
        color: '#4caf50',
        price: 29,
        currency: 'EUR',
        billing: 'monthly',
        description: 'Solução completa para gestão de jardins e espaços verdes',
        features: [
            'Gestão de jardins e plantas',
            'Calendário inteligente de rega',
            'Diagnóstico de pragas e doenças',
            'Catálogo de espécies',
            'Planeamento de podas',
            'Controlo de fertilização'
        ],
        limits: {
            gardens: 50,
            plants: 1000,
            schedules: 'unlimited'
        },
        requiredPermissions: ['garden_management', 'plant_care'],
        category: 'gardening'
    },

    phyto: {
        id: 'phyto',
        name: 'Mobitask Phyto',
        icon: '🧪',
        color: '#ff9800',
        price: 49,
        currency: 'EUR',
        billing: 'monthly',
        description: 'Gestão de produtos fitossanitários e conformidade regulatória',
        features: [
            'Gestão de fitossanitários',
            'Conformidade regulatória',
            'Registo de aplicações',
            'Relatórios de conformidade',
            'Controlo de stocks',
            'Alertas de validade'
        ],
        limits: {
            products: 200,
            applications: 'unlimited',
            reports: 'unlimited'
        },
        requiredPermissions: ['phyto_management', 'regulatory_compliance'],
        category: 'agriculture'
    }
};

// Planos de subscrição
export const SUBSCRIPTION_PLANS = {
    starter: {
        id: 'starter',
        name: 'Starter',
        price: 49,
        currency: 'EUR',
        billing: 'monthly',
        popular: false,
        description: 'Perfeito para começar',
        includedModules: [], // Cliente escolhe 1 módulo
        moduleAllowance: 1,
        features: [
            'Mobitask Base completo',
            '1 módulo à escolha',
            'Até 50 clientes',
            'Suporte por email',
            'Analytics básicos',
            'Backup semanal'
        ],
        limits: {
            clients: 50,
            users: 2,
            storage: '10GB',
            support: 'email'
        }
    },

    professional: {
        id: 'professional',
        name: 'Professional',
        price: 99,
        currency: 'EUR',
        billing: 'monthly',
        popular: true,
        description: 'Para empresas em crescimento',
        includedModules: [], // Cliente escolhe 2 módulos
        moduleAllowance: 2,
        features: [
            'Mobitask Base completo',
            '2 módulos à escolha',
            'Até 200 clientes',
            'Suporte prioritário',
            'Analytics avançados',
            'Backup diário',
            'API básica',
            'Relatórios personalizados'
        ],
        limits: {
            clients: 200,
            users: 5,
            storage: '50GB',
            support: 'priority'
        }
    },

    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 149,
        currency: 'EUR',
        billing: 'monthly',
        popular: false,
        description: 'Para grandes organizações',
        includedModules: ['aqua', 'verde', 'phyto'], // Todos incluídos
        moduleAllowance: 'unlimited',
        features: [
            'Mobitask Base completo',
            'Todos os módulos incluídos',
            'Clientes ilimitados',
            'Suporte 24/7',
            'Analytics premium',
            'Backup em tempo real',
            'API completa',
            'White-label disponível',
            'Gestor de conta dedicado',
            'Integrações personalizadas'
        ],
        limits: {
            clients: 'unlimited',
            users: 'unlimited',
            storage: '200GB',
            support: '24/7'
        }
    }
};

// Features por categoria
export const FEATURE_CATEGORIES = {
    base: {
        name: 'Mobitask Base',
        description: 'Funcionalidades core sempre incluídas',
        features: [
            'Dashboard central',
            'Gestão de clientes',
            'Sistema de notificações',
            'Calendário integrado',
            'Gestão de equipas',
            'Analytics globais',
            'Sistema de subscrições'
        ]
    },

    modules: {
        name: 'Módulos Especializados',
        description: 'Add-ons pagos para funcionalidades específicas',
        features: MODULE_CONFIG
    },

    enterprise: {
        name: 'Enterprise Features',
        description: 'Funcionalidades avançadas para grandes organizações',
        features: [
            'White-label',
            'API personalizada',
            'SSO integration',
            'Advanced analytics',
            'Custom workflows',
            'Dedicated support'
        ]
    }
};

// Configurações de trial
export const TRIAL_CONFIG = {
    duration: 14, // dias
    features: {
        allModules: true, // Acesso a todos os módulos em trial
        fullFeatures: true, // Todas as features disponíveis
        dataExport: false, // Não pode exportar dados
        support: 'limited' // Suporte limitado
    },
    limits: {
        clients: 10,
        analyses: 20,
        reports: 5
    }
};

// Status de licenças
export const LICENSE_STATUS = {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    TRIAL: 'trial',
    CANCELLED: 'cancelled',
    PENDING: 'pending',
    BLOCKED: 'blocked'
};

// Permissões do sistema
export const PERMISSIONS = {
    // Base permissions
    BASE_ACCESS: 'base_access',
    CLIENT_MANAGEMENT: 'client_management',
    TEAM_MANAGEMENT: 'team_management',
    ANALYTICS_VIEW: 'analytics_view',

    // Module permissions
    AQUA_ACCESS: 'aqua_access',
    AQUA_ANALYSIS: 'aqua_analysis',
    POOLS_MANAGEMENT: 'pools_management',
    WATER_ANALYSIS: 'water_analysis',

    VERDE_ACCESS: 'verde_access',
    GARDEN_MANAGEMENT: 'garden_management',
    PLANT_CARE: 'plant_care',

    PHYTO_ACCESS: 'phyto_access',
    PHYTO_MANAGEMENT: 'phyto_management',
    REGULATORY_COMPLIANCE: 'regulatory_compliance',

    // Admin permissions
    ADMIN_ACCESS: 'admin_access',
    BILLING_MANAGEMENT: 'billing_management',
    SUBSCRIPTION_MANAGEMENT: 'subscription_management'
};

export default {
    MODULE_CONFIG,
    SUBSCRIPTION_PLANS,
    FEATURE_CATEGORIES,
    TRIAL_CONFIG,
    LICENSE_STATUS,
    PERMISSIONS
};
