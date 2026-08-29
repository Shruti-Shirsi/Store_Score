import bcrypt from 'bcryptjs'; import { db } from './db.js';
const hash=await bcrypt.hash('Demo@123',12);
const users=[['Alexandra Jennifer Morgan','admin@storescore.demo','101 Administration Avenue, New York, NY','ADMIN'],['Christopher Michael Anderson','owner@storescore.demo','80 Market Street, Austin, TX','OWNER'],['Elizabeth Katherine Thompson','user@storescore.demo','50 Cedar Lane, Portland, OR','USER']];
for(const [name,email,address,role] of users) await db.query('INSERT IGNORE INTO users(name,email,address,password_hash,role) VALUES(?,?,?,?,?)',[name,email,address,hash,role]);
const [[owner]]=await db.query('SELECT id FROM users WHERE email=?',['owner@storescore.demo']); await db.query('INSERT IGNORE INTO stores(name,email,address,owner_id) VALUES(?,?,?,?)',['Harbor & Hearth Bakery','hello@harborhearth.demo','80 Market Street, Austin, TX',owner.id]); console.log('Seeded demo data.'); process.exit();
