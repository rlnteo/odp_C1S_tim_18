import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DbManager } from "./Database/connection/DbConnectionPool";

import { UserRepository } from "./Database/repositories/users/UserRepository";
import { EntityRepository } from "./Database/repositories/entity/EntityRepository";
import { TeamRepository } from "./Database/repositories/team/TeamRepository";
import { ProjectRepository } from "./Database/repositories/project/ProjectRepository";
import { TaskRepository } from "./Database/repositories/task/TaskRepository";
import { AuditRepository } from "./Database/repositories/audit/AuditRepository";

import { AuthService } from "./Services/auth/AuthService";
import { UserService } from "./Services/users/UserService";
import { EntityService } from "./Services/entity/EntityService";
import { HealthService } from "./Services/health/HealthService";
import { TeamService } from "./Services/team/TeamService";
import { ProjectService } from "./Services/project/ProjectService";
import { TaskService } from "./Services/task/TaskService";
import { AuditService } from "./Services/audit/AuditService";

import { AuthController } from "./WebAPI/controllers/AuthController";
import { UserController } from "./WebAPI/controllers/UserController";
import { EntityController } from "./WebAPI/controllers/EntityController";
import { HealthController } from "./WebAPI/controllers/HealthController";
import { StatisticsController } from "./WebAPI/controllers/StatisticsController";
import { TeamController } from "./WebAPI/controllers/TeamController";
import { ProjectController } from "./WebAPI/controllers/ProjectController";
import { TaskController } from "./WebAPI/controllers/TaskController";
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
const auditService = new AuditService(auditRepo);

const teamService = new TeamService(
    teamRepo,   // ITeamRepository
    teamRepo,   // ITeamMemberRepository
    teamRepo,   // ITeamPermissionRepository
    userRepo,   // IUserRepository
);

const projectService = new ProjectService(
    projectRepo,  // IProjectRepository
    projectRepo,  // IProjectTagRepository
    projectRepo,  // IProjectWatcherRepository
    projectRepo,  // IProjectPermissionRepository
);

const taskService = new TaskService(
    taskRepo,   // ITaskRepository
    taskRepo,   // ITaskAssigneeRepository
    taskRepo,   // ITaskCommentRepository
    taskRepo,   // ITaskPermissionRepository
    userRepo,   // IUserRepository
);

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