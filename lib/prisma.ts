import { PrismaClient } from '@prisma/client'

/* Como estás en Next.js 16, si intentas importar PrismaClient 
directamente en cada archivo, 
saturarás las conexiones de Neon cada vez que 
el código se recargue (HMR). Necesitamos una instancia única.
*/

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma