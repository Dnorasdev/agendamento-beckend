# Controle de Férias - Backend

Servidor Node.js para envio automático de e-mails em datas de afastamento e retorno.

## 📦 Instalação

```bash
npm install
```

## 🚀 Rodando localmente

1. Crie um arquivo `.env` baseado no `.env.example`:
```
EMAIL_FROM=seuemail@gmail.com
EMAIL_PASSWORD=sua_senha_de_aplicativo
```

2. Adicione seu arquivo `serviceAccountKey.json` (Firebase Admin SDK).

3. Rode o servidor:
```bash
npm start
```

## ⏰ Agendamento

- Os e-mails serão enviados automaticamente **todos os dias às 08:00 da manhã**.

## ☁️ Deploy

- Pode ser hospedado gratuitamente no [Render](https://render.com/) como Web Service Node.js.

---
