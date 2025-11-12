#!/bin/bash

# 🔄 Script de Sincronização Automática com GitHub
# Execute: bash sync_github.sh "Descrição da alteração"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd /home/ubuntu/conversor_documentos_falconi/nextjs_space

echo -e "${BLUE}🔄 Sincronizando com GitHub...${NC}"
echo ""

# Verificar se tem alterações
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Nenhuma alteração detectada.${NC}"
    echo ""
    echo "📊 Status do repositório:"
    git log --oneline -5
    exit 0
fi

# Mostrar alterações
echo -e "${BLUE}📝 Alterações detectadas:${NC}"
git status --short
echo ""

# Adicionar todas as alterações
echo -e "${BLUE}➕ Adicionando alterações...${NC}"
git add .

# Pegar mensagem do commit
if [ -z "$1" ]; then
    COMMIT_MSG="Update: $(date +'%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

# Fazer commit
echo -e "${BLUE}💾 Fazendo commit...${NC}"
git commit -m "$COMMIT_MSG"

# Fazer push
echo -e "${BLUE}⬆️  Enviando para GitHub...${NC}"
git push origin main 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Sucesso! Alterações publicadas no GitHub!${NC}"
    echo ""
    echo "🔗 Veja em: https://github.com/jptipworld-hash/conversor-documentos-falconi"
    echo ""
    echo "📊 Últimos commits:"
    git log --oneline -3
else
    echo ""
    echo -e "${RED}❌ Erro ao enviar para GitHub.${NC}"
    echo "Tente novamente ou verifique sua conexão."
    exit 1
fi
