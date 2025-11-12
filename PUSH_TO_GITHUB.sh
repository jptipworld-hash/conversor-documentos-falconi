#!/bin/bash

# 🚀 Script para Fazer Push para GitHub
# Execute: bash PUSH_TO_GITHUB.sh

echo "🚀 Iniciando push para GitHub..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd /home/ubuntu/conversor_documentos_falconi/nextjs_space

# Verificar se já tem remote
if git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  Remote 'origin' já existe. Removendo...${NC}"
    git remote remove origin
fi

# Adicionar remote
echo -e "${BLUE}📡 Adicionando remote do GitHub...${NC}"
git remote add origin https://github.com/jptipworld-hash/conversor-documentos-falconi.git

# Renomear branch para main
echo -e "${BLUE}🔄 Renomeando branch para main...${NC}"
git branch -M main

# Fazer push
echo -e "${BLUE}⬆️  Fazendo push para GitHub...${NC}"
echo ""
echo "Você precisará autenticar com suas credenciais do GitHub:"
echo "- Username: jptipworld-hash"
echo "- Password: [seu Personal Access Token]"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Sucesso! Código publicado no GitHub!${NC}"
    echo ""
    echo "🔗 Acesse seu repositório em:"
    echo "   https://github.com/jptipworld-hash/conversor-documentos-falconi"
    echo ""
    echo "🎉 Próximos passos:"
    echo "   1. Visite o repositório para confirmar"
    echo "   2. Considere conectar à Vercel para deploy automático"
    echo "   3. Adicione badges e personalize o README se desejar"
else
    echo ""
    echo -e "${YELLOW}⚠️  Erro ao fazer push.${NC}"
    echo "Possíveis soluções:"
    echo "   1. Certifique-se de que criou o repositório no GitHub"
    echo "   2. Verifique suas credenciais"
    echo "   3. Use um Personal Access Token como senha"
fi
