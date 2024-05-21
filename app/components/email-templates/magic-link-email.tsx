/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import appConfig from "@/breeze.app.config";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

export interface MagicLinkEmailTemplateProps {
  buttonLink: string;
  buttonText: string;
}

const baseUrl = process.env.EMAIL_ASSETS_BASE_URL;

export const MagicLinkEmail = ({ buttonLink, buttonText }: MagicLinkEmailTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your magic link</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}${appConfig.brand.logoUrl}`}
                width="40"
                height="37"
                alt="Vercel"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              {appConfig.brand.appName}
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              🎉 Welcome to {appConfig.brand.appName}! 🎉
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <Text>
                We&apos;re thrilled to have you join us on our journey of to empower developers to
                ship their ideas faster and get profitable. 🚀
              </Text>

              <Text>
                To get started right away, simply click the magic link below to sign in securely to
                your account:
              </Text>

              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                  href={buttonLink}
                >
                  {buttonText || "Join Team"}
                </Button>
              </Section>

              <Text>No passwords to remember — it&apos;s that easy! ✨</Text>

              <Text>
                If you have any questions or need assistance at any point, don&apos;t hesitate to
                reach out.
              </Text>

              <Text>
                Thanks again for choosing {appConfig.brand.appName}! We can&apos;t wait to see what
                you&apos;ll accomplish with us.
              </Text>

              <Text>Happy exploring! 🌟</Text>

              <Text>Best regards,</Text>
              <Text>Paterson, maker of {appConfig.brand.appName}</Text>
            </Text>

            {buttonLink && (
              <Text className="text-black text-[14px] leading-[24px]">
                If the button above does not work, you can also copy and paste this URL into your
                browser:{" "}
                <Link href={buttonLink} className="text-blue-600 no-underline">
                  {buttonLink}
                </Link>
              </Text>
            )}

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you were not expecting this invitation, you can ignore this email. If you are
              concerned about your account&apos;s safety, please reply to this email to get in touch
              with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default MagicLinkEmail;
