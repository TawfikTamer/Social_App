interface IMetaResponse {
  statusCode: number;
  success: boolean;
}

interface IDataResponse<T> {
  message: string;
  data?: T;
}

interface IErrorResponse<T> {
  message: string;
  error?: T;
}

export interface ISuccessResonse<T> {
  meta: IMetaResponse;
  data: IDataResponse<T>;
}

export interface IFailedResonse<T> {
  meta: IMetaResponse;
  error: IErrorResponse<T>;
}
