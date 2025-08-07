import {
    MODULE_CONFIG,
    SUBSCRIPTION_PLANS,
    LICENSE_STATUS,
    TRIAL_CONFIG,
    PERMISSIONS
} from '../../config/modules.config';

export class LicenseManager {
    constructor(userSubscription) {
        this.subscription = userSubscription;
        this.modules = MODULE_CONFIG;
        this.plans = SUBSCRIPTION_PLANS;
    }

    // Verificar se um módulo está licenciado
    isModuleLicensed(moduleId) {
        if (!this.subscription) return false;

        const { status, plan, modules, trialEndsAt } = this.subscription;

        // Verificar se está em trial
        if (status === LICENSE_STATUS.TRIAL) {
            return this.isTrialValid(trialEndsAt);
        }

        // Verificar se a subscrição está ativa
        if (status !== LICENSE_STATUS.ACTIVE) {
            return false;
        }

        // Verificar se o plano inclui o módulo
        const currentPlan = this.plans[plan];
        if (currentPlan && currentPlan.includedModules.includes(moduleId)) {
            return true;
        }

        // Verificar se o módulo foi comprado separadamente
        return modules && modules.includes(moduleId);
    }

    // Verificar se o trial ainda é válido
    isTrialValid(trialEndsAt) {
        if (!trialEndsAt) return false;
        return new Date() < new Date(trialEndsAt);
    }

    // Obter dias restantes do trial
    getTrialDaysRemaining(trialEndsAt) {
        if (!trialEndsAt) return 0;
        const now = new Date();
        const endDate = new Date(trialEndsAt);
        const diffTime = endDate - now;
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Verificar se usuário tem permissão específica
    hasPermission(permission) {
        if (!this.subscription) return false;

        const { permissions } = this.subscription;
        return permissions && permissions.includes(permission);
    }

    // Obter módulos disponíveis para o usuário
    getAvailableModules() {
        const available = [];

        Object.keys(this.modules).forEach(moduleId => {
            if (this.isModuleLicensed(moduleId)) {
                available.push({
                    ...this.modules[moduleId],
                    licensed: true,
                    status: this.getModuleStatus(moduleId)
                });
            }
        });

        return available;
    }

    // Obter módulos não licenciados (para marketplace)
    getUnlicensedModules() {
        const unlicensed = [];

        Object.keys(this.modules).forEach(moduleId => {
            if (!this.isModuleLicensed(moduleId)) {
                unlicensed.push({
                    ...this.modules[moduleId],
                    licensed: false,
                    status: 'unlicensed'
                });
            }
        });

        return unlicensed;
    }

    // Obter status do módulo
    getModuleStatus(moduleId) {
        if (!this.subscription) return 'unlicensed';

        const { status, trialEndsAt } = this.subscription;

        if (status === LICENSE_STATUS.TRIAL) {
            return this.isTrialValid(trialEndsAt) ? 'trial' : 'trial_expired';
        }

        if (this.isModuleLicensed(moduleId)) {
            return status;
        }

        return 'unlicensed';
    }

    // Verificar limites de uso
    checkUsageLimits(moduleId, currentUsage) {
        const module = this.modules[moduleId];
        if (!module) return { allowed: false, message: 'Módulo não encontrado' };

        if (!this.isModuleLicensed(moduleId)) {
            return {
                allowed: false,
                message: 'Módulo não licenciado'
            };
        }

        // Se está em trial, usar limites do trial
        if (this.subscription.status === LICENSE_STATUS.TRIAL) {
            return this.checkTrialLimits(moduleId, currentUsage);
        }

        // Verificar limites do módulo
        const limits = module.limits;
        const violations = [];

        Object.keys(limits).forEach(limitKey => {
            const limit = limits[limitKey];
            const usage = currentUsage[limitKey] || 0;

            if (limit !== 'unlimited' && usage >= limit) {
                violations.push(`${limitKey}: ${usage}/${limit}`);
            }
        });

        return {
            allowed: violations.length === 0,
            message: violations.length > 0 ? `Limites excedidos: ${violations.join(', ')}` : 'OK',
            violations
        };
    }

    // Verificar limites do trial
    checkTrialLimits(moduleId, currentUsage) {
        const trialLimits = TRIAL_CONFIG.limits;
        const violations = [];

        Object.keys(trialLimits).forEach(limitKey => {
            const limit = trialLimits[limitKey];
            const usage = currentUsage[limitKey] || 0;

            if (usage >= limit) {
                violations.push(`${limitKey}: ${usage}/${limit}`);
            }
        });

        return {
            allowed: violations.length === 0,
            message: violations.length > 0 ?
                `Limites do trial excedidos: ${violations.join(', ')}` :
                'OK (Trial)',
            violations,
            trial: true
        };
    }

    // Obter informações da subscrição
    getSubscriptionInfo() {
        if (!this.subscription) {
            return {
                status: 'none',
                plan: null,
                modules: [],
                nextBilling: null,
                trialInfo: null
            };
        }

        const { status, plan, modules, nextBilling, trialEndsAt } = this.subscription;

        return {
            status,
            plan,
            planInfo: this.plans[plan],
            modules: modules || [],
            modulesInfo: this.getAvailableModules(),
            nextBilling,
            trialInfo: status === LICENSE_STATUS.TRIAL ? {
                endsAt: trialEndsAt,
                daysRemaining: this.getTrialDaysRemaining(trialEndsAt)
            } : null
        };
    }

    // Simular upgrade de plano
    simulateUpgrade(newPlanId, additionalModules = []) {
        const newPlan = this.plans[newPlanId];
        if (!newPlan) return null;

        const totalModules = [
            ...newPlan.includedModules,
            ...additionalModules
        ];

        const modulesCost = additionalModules.reduce((total, moduleId) => {
            const module = this.modules[moduleId];
            return total + (module ? module.price : 0);
        }, 0);

        return {
            plan: newPlan,
            modules: totalModules,
            modulesInfo: totalModules.map(id => this.modules[id]).filter(Boolean),
            totalCost: newPlan.price + modulesCost,
            savings: this.calculateSavings(newPlanId, additionalModules)
        };
    }

    // Calcular economia ao fazer upgrade
    calculateSavings(newPlanId, additionalModules = []) {
        const currentCost = this.getCurrentMonthlyCost();
        const newSimulation = this.simulateUpgrade(newPlanId, additionalModules);

        if (!newSimulation) return 0;

        return Math.max(0, currentCost - newSimulation.totalCost);
    }

    // Obter custo mensal atual
    getCurrentMonthlyCost() {
        if (!this.subscription) return 0;

        const { plan, modules } = this.subscription;
        const currentPlan = this.plans[plan];

        let cost = currentPlan ? currentPlan.price : 0;

        // Adicionar custo dos módulos extras
        if (modules) {
            modules.forEach(moduleId => {
                if (!currentPlan.includedModules.includes(moduleId)) {
                    const module = this.modules[moduleId];
                    cost += module ? module.price : 0;
                }
            });
        }

        return cost;
    }
}

// Hook para usar o sistema de licenças
export const useLicenseManager = (userSubscription) => {
    const licenseManager = new LicenseManager(userSubscription);

    return {
        isModuleLicensed: (moduleId) => licenseManager.isModuleLicensed(moduleId),
        hasPermission: (permission) => licenseManager.hasPermission(permission),
        getAvailableModules: () => licenseManager.getAvailableModules(),
        getUnlicensedModules: () => licenseManager.getUnlicensedModules(),
        getModuleStatus: (moduleId) => licenseManager.getModuleStatus(moduleId),
        checkUsageLimits: (moduleId, usage) => licenseManager.checkUsageLimits(moduleId, usage),
        getSubscriptionInfo: () => licenseManager.getSubscriptionInfo(),
        simulateUpgrade: (planId, modules) => licenseManager.simulateUpgrade(planId, modules),
        getCurrentMonthlyCost: () => licenseManager.getCurrentMonthlyCost()
    };
};

// Componente HOC para proteger rotas de módulos
export const withModuleLicense = (moduleId) => (WrappedComponent) => {
    return function ModuleLicenseWrapper(props) {
        const { userSubscription, onLicenseRequired } = props;
        const { isModuleLicensed, getModuleStatus } = useLicenseManager(userSubscription);

        if (!isModuleLicensed(moduleId)) {
            const status = getModuleStatus(moduleId);

            if (onLicenseRequired) {
                onLicenseRequired(moduleId, status);
            }

            return null; // ou componente de bloqueio
        }

        return <WrappedComponent {...props} />;
    };
};

export default LicenseManager;
