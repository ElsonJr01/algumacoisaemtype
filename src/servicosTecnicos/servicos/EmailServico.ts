import nodemailer from 'nodemailer';

export class EmailServico {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async enviarConfirmacaoSolicitacao(dados: {
    nome: string;
    email: string;
    protocolo: string;
  }): Promise<void> {
    if (!process.env.EMAIL_USER) return; // Skip se email não configurado

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || 'RegularizaJá <noreply@regularizaja.com.br>',
      to: dados.email,
      subject: `RegularizaJá — Solicitação Recebida | Protocolo ${dados.protocolo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1A6B3C; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">RegularizaJá</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0;">Plataforma de Regularização Imobiliária</p>
          </div>
          <div style="padding: 32px; background: #f9f9f9;">
            <h2 style="color: #0D3D22;">Olá, ${dados.nome}!</h2>
            <p style="color: #555; line-height: 1.6;">
              Sua solicitação de regularização foi recebida com sucesso. Nossa equipe 
              entrará em contato em até <strong>48 horas</strong>.
            </p>
            <div style="background: #E8F5EE; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0; color: #1A6B3C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Número de Protocolo</p>
              <p style="margin: 8px 0 0; color: #0D3D22; font-size: 24px; font-weight: bold; font-family: monospace;">${dados.protocolo}</p>
            </div>
            <p style="color: #888; font-size: 13px;">
              Guarde este protocolo para acompanhar sua solicitação.
            </p>
          </div>
          <div style="background: #0D3D22; padding: 20px; text-align: center;">
            <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0;">
              © 2025 RegularizaJá — CREA-SP / UNESP / UNIVESP
            </p>
          </div>
        </div>
      `,
    });
  }

  async enviarAtualizacaoStatus(dados: {
    nome: string;
    email: string;
    protocolo: string;
    status: string;
    descricao: string;
  }): Promise<void> {
    if (!process.env.EMAIL_USER) return;

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || 'RegularizaJá <noreply@regularizaja.com.br>',
      to: dados.email,
      subject: `RegularizaJá — Atualização | Protocolo ${dados.protocolo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1A6B3C; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0;">RegularizaJá</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #0D3D22;">Atualização do seu processo</h2>
            <p>Olá, <strong>${dados.nome}</strong>!</p>
            <p style="color: #555;">O status do processo <strong>${dados.protocolo}</strong> foi atualizado:</p>
            <div style="background: #E8F5EE; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <strong style="color: #1A6B3C;">${dados.status}</strong>
              <p style="color: #555; margin: 8px 0 0;">${dados.descricao}</p>
            </div>
          </div>
        </div>
      `,
    });
  }
}
