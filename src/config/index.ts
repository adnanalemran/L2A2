import "dotenv/config"

const config = {
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecretKey: process.env.JWT_SECRET_KEY!,
  refreshTokenSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY!,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "1h",
 
}

export default config