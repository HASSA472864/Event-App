import { v4 as uuidv4 } from "uuid"

export function generateQRCode(): string {
  return uuidv4()
}
