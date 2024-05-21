import { Resend } from "resend";
import {
  TransactionalEmailTemplate,
  TransactionalEmailTemplateProps,
} from "@/components/email-templates";
import appConfig from "@/breeze.app.config";

const resend = new Resend(process.env.RESEND_API_KEY);

interface Params {
  from?: string;
  to: string;
  subject: string;
  bcc?: string | string[];
  cc?: string | string[];
  replyTo?: string;
  emailTemplateProps: TransactionalEmailTemplateProps;
}

/**
 * ----------------------------
 * sendTransactionalEmail
 * ----------------------------
 * Send a transactional email
 * @param {Params}
 */
export async function sendTransactionalEmail(params: Params) {
  console.info("LOGGER: 📧 Sending email");
  try {
    const brandName = appConfig.brand.appName;
    const emailDomain = process.env.RESEND_EMAIL_DOMAIN;
    const defaultFrom = `${brandName} <${`no-reply@${emailDomain}`}>`;
    const response = await resend.emails.send({
      from: params.from || defaultFrom,
      to: params.to,
      subject: params.subject,
      bcc: params.bcc,
      cc: params.cc,
      reply_to: params.replyTo,
      react: TransactionalEmailTemplate({
        ...params.emailTemplateProps,
      }),
    });

    console.info("LOGGER: ✅ Transactional Email sent", response);
    return { error: response.error, data: response };
  } catch (error) {
    console.error("LOGGER: ❌ Sending transactional email error", error);
    return { error: true, data: null };
  }
}
