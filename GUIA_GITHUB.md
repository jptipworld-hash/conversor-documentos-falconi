
# 📘 Guia Rápido: Como Sincronizar com GitHub

## 🎯 Objetivo
Este guia mostra como enviar qualquer alteração feita no projeto para o GitHub automaticamente.

---

## 🚀 Método Rápido (Recomendado)

### **Opção 1: Script Automático**

```bash
# Entre na pasta do projeto
cd /home/ubuntu/conversor_documentos_falconi/nextjs_space

# Execute o script de sincronização
bash sync_github.sh "Descrição da sua alteração"
```

**Exemplos:**
```bash
bash sync_github.sh "Adicionei nova funcionalidade de compressão"
bash sync_github.sh "Corrigi bug na conversão de PDF"
bash sync_github.sh "Atualizei o README com novas instruções"
```

Se não fornecer uma mensagem, será usada a data/hora automaticamente:
```bash
bash sync_github.sh
# Resultado: "Update: 2025-11-12 10:30:45"
```

---

## 📋 Método Manual (Passo a Passo)

Se preferir fazer manualmente:

```bash
# 1. Entre na pasta
cd /home/ubuntu/conversor_documentos_falconi/nextjs_space

# 2. Veja o que mudou
git status

# 3. Adicione as alterações
git add .

# 4. Faça o commit
git commit -m "Descrição da alteração"

# 5. Envie para o GitHub
git push origin main
```

---

## 🔍 Comandos Úteis

### Ver alterações não salvas:
```bash
git status
```

### Ver histórico de commits:
```bash
git log --oneline -10
```

### Ver diferenças específicas:
```bash
git diff
```

### Desfazer alterações locais (cuidado!):
```bash
git checkout -- nome_do_arquivo.ts
```

### Ver repositório remoto:
```bash
git remote -v
```

---

## ✅ Checklist para Alterações

Antes de sincronizar, certifique-se de que:

- [ ] O código está funcionando localmente
- [ ] Você testou as alterações
- [ ] Removeu arquivos temporários/logs desnecessários
- [ ] A mensagem do commit é clara e descritiva

---

## 🎁 Dicas Profissionais

### Mensagens de Commit Eficazes:

✅ **BOM:**
- "Adiciona validação de email no formulário de contato"
- "Corrige erro de divisão por zero na calculadora"
- "Atualiza documentação da API de conversão"

❌ **RUIM:**
- "Update"
- "Fix"
- "Mudanças"

### Boas Práticas:

1. **Commits Pequenos**: Faça commits frequentes com alterações específicas
2. **Seja Descritivo**: Explique o "porquê" da mudança
3. **Teste Antes**: Sempre teste antes de fazer push
4. **Atualize README**: Documente novas funcionalidades

---

## 🆘 Solução de Problemas

### Erro: "remote: Permission denied"
```bash
# Verifique se o token está correto
git remote -v

# Se necessário, reconfigure o remote
git remote set-url origin https://SEU_TOKEN@github.com/jptipworld-hash/conversor-documentos-falconi.git
```

### Erro: "Updates were rejected"
```bash
# Baixe as alterações do GitHub primeiro
git pull origin main --rebase

# Depois faça o push
git push origin main
```

### Erro: "Merge conflict"
```bash
# Veja quais arquivos têm conflito
git status

# Edite os arquivos e remova os marcadores de conflito
# Depois adicione e faça commit
git add .
git commit -m "Resolve conflitos"
git push origin main
```

---

## 🔗 Links Úteis

- **Seu Repositório**: https://github.com/jptipworld-hash/conversor-documentos-falconi
- **GitHub Docs**: https://docs.github.com/pt
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique este guia primeiro
2. Consulte a documentação do Git
3. Peça ajuda ao assistente AI

---

**Última atualização**: 12/11/2025
**Criado por**: Abacus AI DeepAgent
