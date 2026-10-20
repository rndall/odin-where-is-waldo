import "dotenv/config"

export function getConnectionString() {
  return process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL
}
