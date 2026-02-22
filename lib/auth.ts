import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import  prisma  from "@/lib/prisma" // Ajusta la ruta si guardaste prisma.ts en otro lado

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma), // ¡Esta línea hace la magia!
  providers: [Google],
  session: {
    strategy: "jwt",
  }
})