import { prisma } from "prisma/client";
import { PrismaAdapter } from "@/lib/breeze-auth";
import { BreezeAuth } from "@/lib/breeze-auth";
import { sendTransactionalEmail } from "@/services/email.service";

const auth = new BreezeAuth({
  databaseAdapter: PrismaAdapter(prisma),
  cookie: {
    name: "__breeze-auth-session__",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    httpOnly: true,
    sameSite: "lax",
    secret: process.env.COOKIE_SECRET!,
    secure: process.env.NODE_ENV === "production",
  },
});

auth.use({
  type: "credentials",
  resetPasswordPageUrl: "/auth/reset-password",
  emailVerificationPageUrl: "/auth/email/verify",

  /**
   * Uncomment the code below to be able to send a password reset email
   * when a user requests a password reset. You will also need to
   * provide an email service to send the email. By default we use
   * RESEND.COM to send emails. If you want to use resend.com, you
   * just need to provide the API key in the .env file. If you want
   * to use another email service, you will need to modify the sendTransactionalEmail function
   * in the email.service.ts file to use your own email service.
   */
  // sendResetPasswordEmail: async ({ user, resetLink }) => {
  //   const { error } = await sendTransactionalEmail({
  //     to: user.email,
  //     subject: "Password Reset Link",
  //     emailTemplateProps: {
  //       title: "Your password reset link",
  //       description: `Click the link below to reset your password`,
  //       buttonLink: process.env.APP_BASE_URL + resetLink,
  //       buttonText: "Reset Password",
  //     },
  //   });

  //   if (error) {
  //     return {
  //       error: {
  //         message: "Error sending email. Please try again",
  //         code: "send_password_reset_email_error",
  //       },
  //     };
  //   }

  //   return { error: null };
  // },

  /**
   * Uncomment the code below to be able to send an email verification email
   * when a user registers. You will also need to provide an email service to send the email. By default we use
   * RESEND.COM to send emails. If you want to use resend.com, you
   * just need to provide the API key in the .env file. If you want
   * to use another email service, you will need to modify the sendTransactionalEmail function
   * in the email.service.ts file to use your own email service.
   */
  // sendEmailVerificationEmail: async ({ user, verificationLink }) => {
  //   const { error } = await sendTransactionalEmail({
  //     to: user.email,
  //     subject: "Email Verification Link",
  //     emailTemplateProps: {
  //       title: "Your email verification link",
  //       description: `Click the link below to verify your email`,
  //       buttonLink: process.env.APP_BASE_URL + verificationLink,
  //       buttonText: "Verify Email",
  //     },
  //   });

  //   if (error) {
  //     return {
  //       error: {
  //         message: "Error sending email. Please try again",
  //         code: "send_email_verification_email_error",
  //       },
  //     };
  //   }

  //   return { error: null };
  // },
});

export default auth;
