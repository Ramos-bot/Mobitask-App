#!/bin/bash
# Script de sincronização GitHub ↔ Replit
# Uso: ./sync.sh [commit-message]

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Iniciando sincronização GitHub ↔ Replit${NC}"

# Verificar se estamos num repositório Git
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Erro: Não encontrado repositório Git nesta pasta${NC}"
    exit 1
fi

# Verificar se há alterações
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Nenhuma alteração detectada para commit${NC}"
else
    echo -e "${GREEN}📝 Alterações detectadas...${NC}"
    
    # Mostrar status
    git status --short
    
    # Adicionar todos os ficheiros
    echo -e "${BLUE}📦 Adicionando ficheiros...${NC}"
    git add .
    
    # Commit com mensagem personalizada ou padrão
    COMMIT_MSG="${1:-"🔄 Auto-sync: $(date '+%Y-%m-%d %H:%M')"}"
    echo -e "${BLUE}💾 Fazendo commit: ${COMMIT_MSG}${NC}"
    git commit -m "$COMMIT_MSG"
fi

# Push para GitHub
echo -e "${BLUE}🚀 Enviando para GitHub...${NC}"
git push origin main

echo -e "${GREEN}✅ Sincronização completa!${NC}"
echo -e "${YELLOW}💡 No Replit, vai ao Git e faz 'Pull' para obter as alterações${NC}"
