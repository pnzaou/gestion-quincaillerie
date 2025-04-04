import Credentials from "next-auth/providers/credentials";
import dbConnection from "./db";
import User from "@/models/User.model";
import bcrypt from "bcryptjs"

const authOptions = {
    providers: [
        Credentials({
            type: "credentials",
            name: "credentials",
            id: "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await dbConnection()

                const {email, password} = credentials
                const user = await User.findOne({ email })

                if(!user) {
                    return null
                }

                const checkedPassword = await bcrypt.compare(password, user.password)
                if(!checkedPassword) {
                    return null
                }

                return {
                    id: user._id.toString(),
                    name: `${user.prenom} ${user.nom}`,
                    email: user.email,
                    role: user.role 
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }) {
            if(user) {
                token.id = user.id
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session
        }
    },
    secret: process.env.NEXTAUTH_SECRET
}

export default authOptions