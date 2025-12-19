import {
  STATUS_CODE_KEY,
  MESSAGE_KEY,
  SUCCESS_KEY,
  DATA_KEY,
  TIMESTAMP_KEY,
  PATH_KEY,
} from '../constants';

export interface ApiResponse<T> {
  [SUCCESS_KEY]: boolean;
  [STATUS_CODE_KEY]: number;
  [MESSAGE_KEY]: string;
  [DATA_KEY]?: T;
  [TIMESTAMP_KEY]: string;
  [PATH_KEY]?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
