import multer from "multer";

export const multerMiddleWare = () => {
  return multer({
    storage: multer.diskStorage({}),
  });
};
