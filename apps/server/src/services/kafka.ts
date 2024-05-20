import { readFileSync } from "fs";
import { Kafka, Producer } from "kafkajs";
import { resolve } from "path";
import prismaClient from "./prisma";
const kafka = new Kafka({
  brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`],
  ssl: { ca: [readFileSync(resolve("./ca.pem"), "utf-8")] },

  sasl: {
    password: process.env.KAFKA_PASSWORD!,
    username: process.env.KAFKA_USERNAME!,
    mechanism: "plain",
  },
});
let producer: Producer | null = null;
export const MESSAGES_KAFKA_TOPIC = "MESSAGES";
const createProducer = async () => {
  if (producer) return producer;
  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
};

export const produceMessage = async (message: string) => {
  const producer = await createProducer();
  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: MESSAGES_KAFKA_TOPIC,
  });
  return true;
};

export const startMessageConsumer = async () => {
  const consumer = await kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({
    topic: MESSAGES_KAFKA_TOPIC,
    fromBeginning: true,
  });

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;

      try {
        await prismaClient.message.create({
          data: {
            text: message.value?.toString(),
          },
        });
      } catch (err) {
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: MESSAGES_KAFKA_TOPIC }]);
        }, 60 * 1000);
      }
    },
  });
};
export default kafka;
