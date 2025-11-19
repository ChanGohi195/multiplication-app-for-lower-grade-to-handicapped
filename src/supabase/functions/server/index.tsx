import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
export const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-bd4de9a8/health", (c) => {
  return c.json({ status: "ok" });
});

// User registration
app.post("/make-server-bd4de9a8/user/register", async (c) => {
  try {
    const { nickname, pin } = await c.req.json();
    
    if (!nickname || nickname.trim().length === 0) {
      return c.json({ error: "Nickname is required" }, 400);
    }

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return c.json({ error: "PIN must be 4 digits" }, 400);
    }

    const userId = crypto.randomUUID();
    const userData = {
      userId,
      nickname: nickname.trim(),
      pin: pin,
      consecutiveDays: 0,
      totalScore: 0,
      highScore: 0,
      lastDate: "",
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, userData);
    
    return c.json({ userId, nickname: userData.nickname });
  } catch (error) {
    console.log("Error during user registration:", error);
    return c.json({ error: "Failed to register user" }, 500);
  }
});

// Update user stats
app.post("/make-server-bd4de9a8/user/update-stats", async (c) => {
  try {
    const { userId, consecutiveDays, totalScore, highScore, lastDate } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    const existingUser = await kv.get(`user:${userId}`);
    if (!existingUser) {
      return c.json({ error: "User not found" }, 404);
    }

    const updatedUser = {
      ...existingUser,
      consecutiveDays: consecutiveDays ?? existingUser.consecutiveDays,
      totalScore: totalScore ?? existingUser.totalScore,
      highScore: highScore ?? existingUser.highScore,
      lastDate: lastDate ?? existingUser.lastDate,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, updatedUser);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating user stats:", error);
    return c.json({ error: "Failed to update stats" }, 500);
  }
});

// Get leaderboard by consecutive days
app.get("/make-server-bd4de9a8/leaderboard/streak", async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    
    const sortedUsers = users
      .sort((a, b) => b.consecutiveDays - a.consecutiveDays)
      .slice(0, 50)
      .map((user, index) => ({
        rank: index + 1,
        nickname: user.nickname,
        consecutiveDays: user.consecutiveDays
      }));
    
    return c.json(sortedUsers);
  } catch (error) {
    console.log("Error fetching streak leaderboard:", error);
    return c.json({ error: "Failed to fetch leaderboard" }, 500);
  }
});

// Get leaderboard by total score
app.get("/make-server-bd4de9a8/leaderboard/total-score", async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    
    const sortedUsers = users
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 50)
      .map((user, index) => ({
        rank: index + 1,
        nickname: user.nickname,
        totalScore: user.totalScore
      }));
    
    return c.json(sortedUsers);
  } catch (error) {
    console.log("Error fetching total score leaderboard:", error);
    return c.json({ error: "Failed to fetch leaderboard" }, 500);
  }
});

// Get leaderboard by high score
app.get("/make-server-bd4de9a8/leaderboard/high-score", async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    
    const sortedUsers = users
      .sort((a, b) => b.highScore - a.highScore)
      .slice(0, 50)
      .map((user, index) => ({
        rank: index + 1,
        nickname: user.nickname,
        highScore: user.highScore
      }));
    
    return c.json(sortedUsers);
  } catch (error) {
    console.log("Error fetching high score leaderboard:", error);
    return c.json({ error: "Failed to fetch leaderboard" }, 500);
  }
});

// Get user data
app.get("/make-server-bd4de9a8/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const user = await kv.get(`user:${userId}`);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    return c.json(user);
  } catch (error) {
    console.log("Error fetching user data:", error);
    return c.json({ error: "Failed to fetch user data" }, 500);
  }
});

// Verify user PIN
app.post("/make-server-bd4de9a8/user/verify-pin", async (c) => {
  try {
    const { userId, pin } = await c.req.json();
    
    if (!userId || !pin) {
      return c.json({ error: "User ID and PIN are required" }, 400);
    }

    const user = await kv.get(`user:${userId}`);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    if (user.pin !== pin) {
      return c.json({ error: "Invalid PIN" }, 401);
    }
    
    return c.json({ 
      success: true, 
      userId: user.userId, 
      nickname: user.nickname 
    });
  } catch (error) {
    console.log("Error verifying PIN:", error);
    return c.json({ error: "Failed to verify PIN" }, 500);
  }
});

// Admin: list all users (for management UI)
app.get("/make-server-bd4de9a8/admin/users", async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    return c.json({ users });
  } catch (error) {
    console.log("Error fetching admin users:", error);
    return c.json({ error: "Failed to fetch admin users" }, 500);
  }
});

// Admin: update user metadata (nickname/grade/class)
app.put("/make-server-bd4de9a8/admin/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const updates = await c.req.json();
    const existing = await kv.get(`user:${userId}`);

    if (!existing) {
      return c.json({ error: "User not found" }, 404);
    }

    const updated = {
      ...existing,
      nickname: updates.nickname ?? existing.nickname,
      grade: updates.grade ?? existing.grade,
      class: updates.class ?? existing.class,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, updated);
    return c.json({ success: true, user: updated });
  } catch (error) {
    console.log("Error updating user:", error);
    return c.json({ error: "Failed to update user" }, 500);
  }
});

// Admin: delete user
app.delete("/make-server-bd4de9a8/admin/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    await kv.del(`user:${userId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting user:", error);
    return c.json({ error: "Failed to delete user" }, 500);
  }
});

// Server-side login to support cross-device relogin by nickname+pin
app.post("/make-server-bd4de9a8/user/login", async (c) => {
  try {
    const { nickname, pin } = await c.req.json();

    if (!nickname || !pin) {
      return c.json({ error: "Nickname and PIN are required" }, 400);
    }

    const users = await kv.getByPrefix("user:");
    const found = users.find(
      (u) => u.nickname?.toLowerCase() === nickname.trim().toLowerCase(),
    );

    if (!found) {
      return c.json({ error: "User not found" }, 404);
    }

    if (found.pin !== pin) {
      return c.json({ error: "Invalid PIN" }, 401);
    }

    return c.json({
      success: true,
      userId: found.userId,
      nickname: found.nickname,
    });
  } catch (error) {
    console.log("Error during server-side login:", error);
    return c.json({ error: "Failed to login user" }, 500);
  }
});

export default app;
