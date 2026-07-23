// utils/apiResponse.ts

export class ApiResponse<T> {
  public status: number;
  public success: boolean;
  public message: string;
  public data: T;

  constructor(
    status: number,
    data: T,
    message: string = "Success"
  ) {
    this.status = status;
    this.data = data;
    this.message = message;
    this.success = status < 400;
  }
}