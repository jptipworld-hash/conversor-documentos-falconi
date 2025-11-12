
# 📄 Conversor de Documentos Falconi

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2.28-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Aplicativo web profissional para conversão de documentos com processamento 100% em memória para máxima segurança.**

[🚀 Demo Online](https://doc-converter.abacusai.app) • [📖 Documentação](#funcionalidades) • [🐛 Reportar Bug](https://github.com/SEU-USUARIO/conversor-documentos/issues)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Deploy](#deploy)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Segurança](#segurança)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

O **Conversor de Documentos Falconi** é uma aplicação web moderna e segura que permite converter diversos formatos de documentos de forma rápida e privada. Todo o processamento é feito **100% em memória**, garantindo que nenhum arquivo seja armazenado em servidores.

### ✨ Diferenciais

- 🔒 **Privacidade Total**: Nenhum arquivo é armazenado
- ⚡ **Processamento Rápido**: Conversões em segundos
- 🎨 **Interface Moderna**: Design responsivo e intuitivo
- 🛡️ **Código Aberto**: Totalmente auditável
- 📱 **Mobile-Friendly**: Funciona em qualquer dispositivo

---

## 🚀 Funcionalidades

### Conversões Disponíveis

| Funcionalidade | Descrição | Status |
|----------------|-----------|--------|
| **📑 Juntar PDF** | Mescla múltiplos arquivos PDF em um único documento | ✅ Ativo |
| **✂️ Dividir PDF** | Separa um PDF em páginas individuais (arquivo ZIP) | ✅ Ativo |
| **📝 Word → PDF** | Converte documentos .docx para PDF com formatação preservada | ✅ Ativo |
| **📄 PDF → Word** | Extrai texto de PDFs e gera documentos .docx | ✅ Ativo |
| **📊 Excel → PDF** | Converte planilhas Excel para PDF | ✅ Ativo |
| **📈 PDF → Excel** | Extrai dados de PDFs para planilhas Excel | ✅ Ativo |
| **🎤 PowerPoint → PDF** | Converte apresentações PPT/PPTX para PDF | ✅ Ativo |
| **📋 TXT ↔ CSV** | Converte entre formatos de texto simples e CSV | ✅ Ativo |

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14.2.28** - Framework React com SSR
- **React 18.2.0** - Biblioteca UI
- **TypeScript 5.2.2** - Tipagem estática
- **Tailwind CSS 3.3.3** - Framework CSS utilitário

### Processamento de Documentos
- **pdf-lib** - Manipulação de PDFs
- **mammoth** - Conversão Word → HTML
- **pdf-parse** - Extração de texto de PDFs
- **docx** - Criação de documentos Word
- **exceljs** - Manipulação de planilhas
- **jszip** - Criação de arquivos ZIP

### Bibliotecas UI
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones modernos
- **Sonner** - Notificações toast

---

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ ou superior
- Yarn ou npm

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/SEU-USUARIO/conversor-documentos.git

# 2. Entre na pasta do projeto
cd conversor-documentos/nextjs_space

# 3. Instale as dependências
yarn install
# ou
npm install

# 4. Configure variáveis de ambiente (opcional)
cp .env.example .env.local

# 5. Inicie o servidor de desenvolvimento
yarn dev
# ou
npm run dev

# 6. Abra no navegador
# http://localhost:3000
```

---

## 💻 Como Usar

### Interface Web

1. **Selecione o tipo de conversão** desejada no grid de cards
2. **Faça upload do arquivo** (arraste e solte ou clique para selecionar)
3. **Aguarde o processamento** (alguns segundos)
4. **Baixe o arquivo convertido** automaticamente

### Exemplo de Código (API)

```typescript
// Exemplo: Juntar PDFs
const formData = new FormData();
formData.append('file', pdfFile1);
formData.append('file', pdfFile2);

const response = await fetch('/api/convert/pdf-merge', {
  method: 'POST',
  body: formData,
});

const blob = await response.blob();
// Download automático do PDF mesclado
```

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Na pasta do projeto
cd nextjs_space
vercel

# Siga as instruções interativas
```

### Outras Plataformas

O projeto é compatível com:
- **Netlify**
- **AWS Amplify**
- **Google Cloud Run**
- **Azure Static Web Apps**
- **DigitalOcean App Platform**

---

## 📁 Estrutura do Projeto

```
nextjs_space/
├── app/
│   ├── api/
│   │   └── convert/           # Endpoints de conversão
│   │       ├── pdf-merge/     # Mesclar PDFs
│   │       ├── pdf-split/     # Dividir PDFs
│   │       ├── word-to-pdf/   # Word → PDF
│   │       ├── pdf-to-word/   # PDF → Word
│   │       ├── excel-to-pdf/  # Excel → PDF
│   │       ├── pdf-to-excel/  # PDF → Excel
│   │       ├── ppt-to-pdf/    # PPT → PDF
│   │       └── txt-csv/       # TXT ↔ CSV
│   ├── globals.css            # Estilos globais
│   ├── layout.tsx             # Layout principal
│   └── page.tsx               # Página inicial
├── components/
│   ├── ui/                    # Componentes Radix UI
│   ├── conversion-card.tsx    # Card de conversão
│   ├── conversion-grid.tsx    # Grid de conversores
│   ├── file-upload.tsx        # Upload de arquivos
│   ├── footer.tsx             # Rodapé
│   └── header.tsx             # Cabeçalho
├── lib/
│   ├── conversion-utils.ts    # Utilitários de conversão
│   ├── file-utils.ts          # Utilitários de arquivos
│   └── utils.ts               # Utilitários gerais
├── public/                    # Arquivos estáticos
├── package.json               # Dependências
├── tsconfig.json              # Config TypeScript
├── next.config.js             # Config Next.js
└── tailwind.config.ts         # Config Tailwind
```

---

## 🔒 Segurança

### Princípios de Segurança

✅ **Processamento em Memória**: Nenhum arquivo é salvo em disco  
✅ **Sem Armazenamento**: Zero persistência de dados do usuário  
✅ **HTTPS Obrigatório**: Criptografia de ponta a ponta  
✅ **Validação de Arquivos**: Checagem de tipos e tamanhos  
✅ **Sem Logs de Conteúdo**: Apenas logs de erro técnico  

### Boas Práticas

- Os arquivos são processados completamente em memória
- Buffers são descartados após o processamento
- Não há conexão com bancos de dados
- Não há sistema de autenticação (sem coleta de dados)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga estes passos:

1. **Fork** o projeto
2. **Crie uma branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. **Abra um Pull Request**

### Reportando Bugs

Use as [GitHub Issues](https://github.com/SEU-USUARIO/conversor-documentos/issues) para reportar bugs.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autor

**Desenvolvido para Falconi**

- Website: [https://doc-converter.abacusai.app](https://doc-converter.abacusai.app)
- GitHub: [@SEU-USUARIO](https://github.com/SEU-USUARIO)

---

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React incrível
- [Radix UI](https://www.radix-ui.com/) - Componentes acessíveis
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [pdf-lib](https://pdf-lib.js.org/) - Manipulação de PDFs
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) - Conversão Word

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**

Feito com ❤️ usando Next.js e TypeScript

</div>
