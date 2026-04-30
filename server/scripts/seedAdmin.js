import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  const mongoUri = process.env.MONGO_URI;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in .env");
  }

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env");
  }

  await mongoose.connect(mongoUri);

  const uid = "admin-user-001";

  const adminUser = await User.findOneAndUpdate(
    { email: adminEmail },
    {
      $set: {
        uid,
        email: adminEmail,
        password: adminPassword,
        isAdmin: true,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  console.log("Admin user seeded successfully");
  console.log(`uid=${adminUser.uid}`);
  console.log(`email=${adminUser.email}`);
  console.log(`isAdmin=${adminUser.isAdmin}`);
};

run()
  .catch((error) => {
    console.error("Failed to seed admin user:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
