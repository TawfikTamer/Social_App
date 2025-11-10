import crypto, { Cipheriv, Decipheriv } from "crypto";

const ENCRYPTION_KEY: Buffer = Buffer.from(process.env.ENCRYPTION_KEY as string, "base64"); // bufer

export const encrypt = (text: string): string => {
  const iv: Buffer = crypto.randomBytes(parseInt(process.env.IV_LENGTH as string)); // buffer

  const cipher: Cipheriv = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

  let encryptedText: string = cipher.update(text, "utf-8", "hex");

  encryptedText += cipher.final("hex");

  return iv.toString("hex") + ":" + encryptedText;
};

export const decrypt = (encryptedText: string): string => {
  const [ivHex, cipher] = encryptedText.split(":");

  const iv: Buffer = Buffer.from(ivHex, "hex");

  const decipher: Decipheriv = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

  let text: string = decipher.update(cipher, "hex", "utf-8");

  text += decipher.final("utf-8");

  return text;
};
