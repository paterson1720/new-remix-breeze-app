/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
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

export interface TransactionalEmailTemplateProps {
  /**
   * The title of the email body
   */
  title: string;
  /**
   * The description of the email body, can be plain text or html
   * @example <p>Some html</p>
   * @example Some plain text
   */
  description: string;
  /**
   * If you want to add a button to the email body, provide a link here
   * @example https://full-stack-kit.dev/checkout
   */
  buttonLink?: string;
  /**
   * If you want to add a button to the email body, provide the text here
   * @example Checkout
   */
  buttonText?: string;
}

const baseUrl = process.env.EMAIL_ASSETS_BASE_URL;

export const TransactionalEmailTemplate = ({
  title,
  description,
  buttonLink,
  buttonText,
}: TransactionalEmailTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
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

            <Text className="text-black text-[14px] leading-[24px]">{title}</Text>

            <Text className="text-black text-[14px] leading-[24px]">
              <Text
                dangerouslySetInnerHTML={{
                  __html: description,
                }}
              />

              {buttonLink && buttonText && (
                <Section className="text-center mt-[32px] mb-[32px]">
                  <Button
                    className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                    href={buttonLink}
                  >
                    {buttonText || "Join Team"}
                  </Button>
                </Section>
              )}

              <Text>Best regards,</Text>
              <Text>The {appConfig.brand.appName} team.</Text>
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
              If you were not expecting this email, you can ignore it. If you are concerned about
              your account&apos;s safety, please reply to this email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TransactionalEmailTemplate;
