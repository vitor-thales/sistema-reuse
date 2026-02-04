import * as Brevo from "@getbrevo/brevo";
import { env } from "../config/env.js";

const apiInstance = new Brevo.TransactionalSMSApi();

apiInstance.setApiKey(Brevo.TransactionalSMSApiApiKeys.apiKey, env.BREVO_API_KEY);

export const sendVerificationSMS = async (phoneNumber, code) => {
    const sendTransacSMS = new Brevo.SendTransacSms();

    sendTransacSMS.sender = env.SMS_SENDER_NAME;
    sendTransacSMS.recipient = phoneNumber;
    sendTransacSMS.content = `ReUse: Seu código de verificação é ${code}. Não o compartilhe com ninguém.`;
    sendTransacSMS.type = "transactional";

    try {
        const data = await apiInstance.sendTransacSms(sendTransacSMS);
        console.log("[+] SMS enviado com sucesso: ", data.body);
        return true;
    } catch (err) {
        console.error("[-] Erro ao enviar SMS Brevo:", err.response ? err.response : err);
        return false;
    }
};