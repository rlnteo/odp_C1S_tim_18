import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DbManager } from "./Database/connection/DbConnectionPool";

import { UserRepository } from "./Database/repositories/users/UserRepository";
import { EntityRepository } from "./Database/repositories/entity/EntityRepository";

import { AuthService } from "./Services/auth/AuthService";
import { UserService } from "./Services/users/UserService";
import { EntityService } from "./Services/entity/EntityService";
import { HealthService } from "./Services/health/HealthService";

import { AuthController } from "./WebAPI/controllers/AuthController";
import { UserController } from "./WebAPI/controllers/UserController";
import { EntityController } from "./WebAPI/controllers/EntityController";
import { HealthController } from "./WebAPI/controllers/HealthController";
import { StatisticsController } from "./WebAPI/controllers/StatisticsController";

import { TeamRepository } from "./Database/repositories/team/TeamRepository";
import { TeamService } from "./Services/team/TeamService";
import { TeamController } from "./WebAPI/controllers/TeamController";

import { ProjectRepository } from "./Database/repositories/project/ProjectRepository";
import { ProjectService } from "./Services/project/ProjectService";
import { ProjectController } from "./WebAPI/controllers/ProjectController";

import { TaskRepository } from "./Database/repositories/task/TaskRepository";
import { TaskService } from "./Services/task/TaskService";
import { TaskController } from "./WebAPI/controllers/TaskController";

import { AuditRepository } from "./Database/repositories/audit/AuditRepository";
import { AuditService } from "./Services/audit/AuditService";
import { AuditController } from "./WebAPI/controllers/AuditController";

export const logger = new ConsoleLoggerService();
export const db = new DbManager(logger);

// Repositories
const userRepo = new UserRepository(db, logger);
const entityRepo = new EntityRepository(db, logger);
const teamRepo = new TeamRepository(db, logger);
const projectRepo = new ProjectRepository(db, logger);
const taskRepo = new TaskRepository(db, logger);
const auditRepo = new AuditRepository(db, logger);

// Services
const authService = new AuthService(userRepo);
const userService = new UserService(userRepo);
const entityService = new EntityService(entityRepo);
const healthService = new HealthService(db, userRepo);
const teamService = new TeamService(teamRepo, userRepo);
const projectService = new ProjectService(projectRepo);
const taskService = new TaskService(taskRepo, userRepo);
const auditService = new AuditService(auditRepo);

// Express
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json());

app.use("/api/v1", new AuthController(authService, auditService).getRouter());
app.use("/api/v1", new UserController(userService).getRouter());
app.use("/api/v1", new EntityController(entityService).getRouter());
app.use("/api/v1", new HealthController(healthService).getRouter());
app.use("/api/v1", new StatisticsController(healthService).getRouter());
app.use("/api/v1", new TeamController(teamService).getRouter());
app.use("/api/v1", new ProjectController(projectService).getRouter());
app.use("/api/v1", new TaskController(taskService).getRouter());
app.use("/api/v1", new AuditController(auditService).getRouter());

export default app;
