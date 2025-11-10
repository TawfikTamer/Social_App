import bcrypt from "bcrypt";

export const hashingData = async (data: string, salt: string | number): Promise<string> => {
  return await bcrypt.hash(data, parseInt(salt as string));
};

export const compareHashedData = async (data: string, hashedData: string): Promise<boolean> => {
  return await bcrypt.compare(data, hashedData);
};
