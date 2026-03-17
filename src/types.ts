export interface Service {
  reference: string
  fullReference: string
  name: string
  provider?: string
  type: 'tv' | 'radio'
  frequency?: string
  symbolRate?: string
  polarization?: string
}

export interface BouquetService {
  reference: string
  name?: string
}

export interface Bouquet {
  filename: string
  name: string
  services: BouquetService[]
  type: 'tv' | 'radio'
}

export interface ReceiverProfile {
  id: string
  name: string
  host: string
  user: string
  password?: string
  port?: number
}
