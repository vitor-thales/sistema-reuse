import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
    host: env.SMTP_SERVER,
    port: env.SMTP_PORT,
    auth: {
        user: env.BREVO_LOGIN,
        pass: env.BREVO_PASS
    }
});

export const sendSolicitationEmail = async (userEmail, userName) => {
    const mailOptions = {
        from: `"${env.MAIL_NAME}" <${env.MAIL_SENDER}>`,
        to: userEmail,
        subject: "Solicitação de Cadastro em Análise ♻️",
        html: `
            <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .header { background-color: #2563eb; padding: 30px; text-align: center; } /* Using your mainblue */
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px; }
            .content { padding: 40px 30px; line-height: 1.6; color: #333333; }
            .content h2 { color: #1e3a8a; font-size: 22px; } /* Using your darkblue */
            .status-badge { display: inline-block; background-color: #eff6ff; border: 1px solid #2563eb; color: #2563eb; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
            .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>ReUse</h1>
            </div>
            <div class="content">
                <h2>Olá, ${userName}!</h2>
                <p>Recebemos sua solicitação para se tornar um parceiro do <strong>ReUse</strong>, o maior sistema de venda de resíduos eletrônicos do Brasil.</p>
                
                <div style="text-align: center;">
                    <div class="status-badge">
                        <span style="margin-right: 5px;">⏳</span> STATUS: EM ANÁLISE
                    </div>
                </div>

                <p>Nossa equipe técnica está revisando os documentos anexados. Este processo garante a segurança de todos os negociantes em nossa plataforma.</p>
                
                <div class="divider"></div>
                
                <p><strong>O que acontece agora?</strong></p>
                <ul>
                    <li>Análise documental (1-3 dias úteis).</li>
                    <li>Você receberá um e-mail de aprovação ou feedback.</li>
                    <li>Após aprovado, seu acesso total será liberado.</li>
                </ul>

                <p>Se tiver alguma dúvida, sinta-se à vontade para responder a este e-mail.</p>
                
                <p>Atenciosamente,<br>
                <strong>Equipe de Onboarding ReUse</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2026 ReUse Brasil - Reciclagem Tecnológica Sustentável</p>
                <p>Você recebeu este e-mail porque uma solicitação de cadastro foi realizada com este endereço.</p>
            </div>
        </div>
    </body>
    </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("[+] E-mail de confirmação enviado!");
    } catch(error) {
        console.error("Erro ao enviar e-mail: ", error);
    }
};