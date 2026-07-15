import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const dataDir = path.resolve('data');
const usersFile = path.join(dataDir, 'users.json');
const adminEmail = (process.env.ADMIN_EMAIL || 'rohit@example.com').toLowerCase();

export async function readUsers() {
  try {
    return JSON.parse(await readFile(usersFile, 'utf8'));
  } catch {
    return [];
  }
}

export async function writeUsers(users) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(usersFile, JSON.stringify(users, null, 2));
}

export async function createLocalUser(payload) {
  const users = await readUsers();
  const email = payload.email.toLowerCase();
  if (users.some((user) => user.email === email)) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = {
    id: randomUUID(),
    name: payload.name,
    email,
    password: await bcrypt.hash(payload.password, 12),
    role: email === adminEmail ? 'admin' : 'user',
    title: email === adminEmail ? 'Founder Admin' : 'CareerPilot Member',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80',
    profile: { skills: [] },
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);
  return sanitizeLocalUser(user);
}

export async function verifyLocalUser(email, password) {
  const users = await readUsers();
  const user = users.find((item) => item.email === email.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password))) return null;
  return sanitizeLocalUser(user);
}

export async function findLocalUserById(id) {
  const users = await readUsers();
  const user = users.find((item) => item.id === id);
  return user ? sanitizeLocalUser(user) : null;
}

export async function updateLocalUser(id, payload) {
  const users = await readUsers();
  const index = users.findIndex((item) => item.id === id);
  if (index === -1) return null;
  users[index] = {
    ...users[index],
    name: payload.name ?? users[index].name,
    title: payload.title ?? users[index].title,
    avatar: payload.avatar ?? users[index].avatar,
    profile: { ...(users[index].profile || {}), ...(payload.profile || {}) },
    xp: payload.xp ?? users[index].xp ?? 0,
    level: payload.level ?? users[index].level ?? 1,
    streak: { ...(users[index].streak || { current: 0, best: 0, lastActive: '' }), ...(payload.streak || {}) },
    activeRoadmap: payload.activeRoadmap ?? users[index].activeRoadmap ?? null,
    activeSkillGap: payload.activeSkillGap ?? users[index].activeSkillGap ?? null,
    activeInterview: payload.activeInterview ?? users[index].activeInterview ?? null,
    completedInterviews: payload.completedInterviews ?? users[index].completedInterviews ?? [],
    updatedAt: new Date().toISOString(),
  };
  await writeUsers(users);
  return sanitizeLocalUser(users[index]);
}

export function sanitizeLocalUser(user) {
  const isVerified = process.env.NODE_ENV !== 'production' ? true : (user.isVerified ?? user.emailVerified ?? false);
  return {
    id: user.id,
    firebaseUid: user.firebaseUid,
    name: user.name,
    email: user.email,
    role: user.email === adminEmail ? 'admin' : user.role || 'user',
    title: user.title,
    avatar: user.avatar,
    photoURL: user.photoURL || user.avatar,
    isVerified,
    emailVerified: isVerified,
    authProvider: user.authProvider || 'password',
    profile: user.profile || {},
    xp: user.xp || 0,
    level: user.level || 1,
    streak: user.streak || { current: 0, best: 0, lastActive: '' },
    activeRoadmap: user.activeRoadmap || null,
    activeSkillGap: user.activeSkillGap || null,
    activeInterview: user.activeInterview || null,
    completedInterviews: user.completedInterviews || [],
    createdAt: user.createdAt,
  };
}

export async function syncFirebaseLocalUser({ uid, email, name, picture, emailVerified, authProvider }) {
  const users = await readUsers();
  const normalizedEmail = email.toLowerCase();
  
  let user = users.find((u) => u.firebaseUid === uid || u.email === normalizedEmail);
  
  if (user) {
    // Update existing user with firebase info if not present or changed
    user.firebaseUid = uid;
    if (picture) {
      user.avatar = picture;
      user.photoURL = picture;
    }
    user.emailVerified = emailVerified ?? user.emailVerified ?? false;
    user.authProvider = authProvider || user.authProvider || 'password';
    user.updatedAt = new Date().toISOString();
  } else {
    // Create new user automatically on first login
    user = {
      id: randomUUID(),
      firebaseUid: uid,
      name: name || email.split('@')[0],
      email: normalizedEmail,
      role: normalizedEmail === adminEmail ? 'admin' : 'user',
      title: normalizedEmail === adminEmail ? 'Founder Admin' : 'CareerPilot Member',
      avatar: picture || 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80',
      photoURL: picture || 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80',
      emailVerified: emailVerified ?? false,
      authProvider: authProvider || 'password',
      profile: { skills: [] },
      createdAt: new Date().toISOString(),
    };
    users.push(user);
  }
  
  await writeUsers(users);
  return sanitizeLocalUser(user);
}

export async function findLocalUserByFirebaseUid(uid) {
  const users = await readUsers();
  const user = users.find((u) => u.firebaseUid === uid);
  return user ? sanitizeLocalUser(user) : null;
}
