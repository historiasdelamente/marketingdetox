import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_SES_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL || "hola@historiasdelamente.com";
const FROM_NAME = process.env.SES_FROM_NAME || "Historias de la Mente";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<string> {
  const toAddresses = Array.isArray(params.to) ? params.to : [params.to];

  const command = new SendEmailCommand({
    Source: `${FROM_NAME} <${FROM_EMAIL}>`,
    Destination: {
      ToAddresses: toAddresses,
    },
    Message: {
      Subject: {
        Data: params.subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: params.html,
          Charset: "UTF-8",
        },
      },
    },
    ReplyToAddresses: params.replyTo ? [params.replyTo] : undefined,
  });

  const result = await ses.send(command);
  return result.MessageId || "sent";
}

export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  html: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  // SES rate limit: 14/sec (from memory). Send in batches.
  const BATCH_SIZE = 10;
  const DELAY_MS = 1000;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (to) => {
      try {
        await sendEmail({ to, subject, html });
        results.sent++;
      } catch (err) {
        results.failed++;
        results.errors.push(
          `${to}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    });

    await Promise.all(promises);

    // Rate limiting delay between batches
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  return results;
}
