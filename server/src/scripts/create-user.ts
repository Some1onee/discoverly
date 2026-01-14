// Script to create a default user
import bcrypt from "bcrypt";
import { initDB, run } from "../db/schema.js";

async function createUser() {
  try {
    await initDB();
    
    const username = "niel";
    const email = "niel@example.com";
    const password = "password123";
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await run(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );
    
    console.log("✅ Utilisateur créé avec succès !");
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log("\nVous pouvez maintenant vous connecter avec ces identifiants.");
  } catch (error: any) {
    console.error("Erreur lors de la création de l'utilisateur:", error.message);
  }
}

createUser();
