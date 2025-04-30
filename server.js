require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { db } = require('./firebase');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  }
});

// Função para enviar e-mail
const enviarEmail = async (destino, assunto, corpo) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: destino,
    subject: assunto,
    html: corpo
  });
};

// Função para capitalizar textos
const capitalizar = (texto) => {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .split(' ')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  };
  

// Função para gerar o corpo do e-mail (com cor dinâmica)
const gerarCorpoEmail = ({ tipo, nome, funcao, data, corData }) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
          <div style="text-align: center;">
            <img src="https://controle-ferias-backend.onrender.com/logo.png" alt="Logo Silimed" style="max-width: 120px; margin-bottom: 20px;" />
            <h2 style="color: #d9534f; text-align: center;">${tipo} de usuário</h2>
            <p style="font-size: 16px;"><strong>Nome:</strong> ${capitalizar(nome)}</p>
            <p style="font-size: 16px;"><strong>Função:</strong> ${capitalizar(funcao)}</p>
            <p style="font-size: 16px;">
              <strong>Data:</strong> 
              <span style="color: ${corData}; font-weight: bold;">
                ${data}
              </span>
            </p>
            <hr style="margin: 20px 0;" />
            <p style="font-size: 14px; color: #888; text-align: center;">
              Este e-mail foi enviado automaticamente pelo sistema de controle de férias.<br/>
              Por favor, não responda.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Função principal de verificação e envio
const verificarEEnviarEmails = async () => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const snapshot = await db.collection('usuarios').get();

  snapshot.forEach(async (doc) => {
    const dados = doc.data();

    const afastamento = dados.afastamento ? new Date(dados.afastamento.split('/').reverse().join('-')) : null;
    const retorno = dados.retorno ? new Date(dados.retorno.split('/').reverse().join('-')) : null;

    const destino = 'fernando.cruz@silimed.com.br'; // ⬅️ Altere para o e-mail real que você deseja enviar

    if (afastamento && afastamento.getTime() === hoje.getTime()) {
      console.log(`📤 Enviando email de afastamento para ${dados.nome}`);

      const corpo = gerarCorpoEmail({
        tipo: 'Afastamento',
        nome: dados.nome,
        funcao: dados.funcao,
        data: dados.afastamento,
        corData: '#d9534f' // vermelho para afastamento
      });

      await enviarEmail(destino, `Afastamento - ${dados.nome}`, corpo);
    }

    if (retorno && retorno.getTime() === hoje.getTime()) {
      console.log(`📤 Enviando email de retorno para ${dados.nome}`);

      const corpo = gerarCorpoEmail({
        tipo: 'Retorno',
        nome: dados.nome,
        funcao: dados.funcao,
        data: dados.retorno,
        corData: '#5cb85c' // verde para retorno
      });

      await enviarEmail(destino, `Retorno - ${dados.nome}`, corpo);
    }
  });
};

// Agendamento diário às 08:00
const task = cron.schedule('10 11 * * *', () => {
  console.log('⏰ Rodando verificação de emails às 08:00 BRT');
  verificarEEnviarEmails();
}, {
  timezone: 'America/Sao_Paulo'
});

// Rota manual para teste
app.get('/teste', (req, res) => {
  verificarEEnviarEmails();
  res.send('Verificação manual executada.');
});

// Inicializar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
