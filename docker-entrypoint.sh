#!/bin/sh
set -e

echo "🚀 Starting FamilyMind AI..."

# Ensure data directory exists
mkdir -p /app/data

# Run prisma schema push to initialize/sync SQLite tables
echo "📦 Syncing database schema with Prisma..."
npx prisma db push

# Check if database needs initial seeding
# We check if Person count is 0
echo "🌱 Checking if seeding is required..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.person.count().then(count => {
  if (count === 0) {
    console.log('Database empty. Running seed...');
    process.exit(10);
  } else {
    console.log('Database already contains ' + count + ' persons. Skipping seed.');
    process.exit(0);
  }
}).catch(err => {
  console.error(err);
  process.exit(1);
});
" || NEED_SEED=$?

if [ "$NEED_SEED" = "10" ]; then
  echo "🌱 Seeding demo family network (Liza in center)..."
  npm run seed
fi

echo "✨ Ready! Launching Next.js server on port ${PORT:-3000}..."
exec npm run start
