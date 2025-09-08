import axios, { AxiosInstance } from 'axios'

export class Api {
  private base_url: string
  private axios: AxiosInstance

  private constructor(base_url: string) {
    this.base_url = base_url
  }

  public get client(): AxiosInstance {
    if (!this.axios) {
      this.axios = axios.create({ baseURL: this.base_url })
    }

    return this.axios
  }

  static create(base_url: string): Api {
    return new Api(base_url)
  }
}
