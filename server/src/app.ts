import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DbManager } from "./Database/connection/DbConnectionPool";

import { UserRepository } from "./Database/repositories/users/UserRepository";
import { EntityRepository } from "./Database/repositories/entity/EntityRepository";

import { TeamRepository } from "./Database/repositories/team/TeamRepository";
import { TeamMemberRepository } from "./Database/repositories/team/TeamMemberRepository";
import { TeamPermissionRepository } from './Database/repositories/team/TeamPermissionRepository';

import { ProjectRepository } from "./Database/repositories/project/ProjectRepository";
import { ProjectTagRepository } from "./Database/repositories/project/ProjectTagRepository";
import { ProjectPermissionRepository } from "./Database/repositories/project/ProjectPermissionRepository";
import { ProjectWatcherRepository } from "./Database/repositories/project/ProjectWatcherRepository";

import { TaskRepository } from "./Database/repositories/task/TaskRepository";
import { TaskAssigneeRepository } from "./Database/repositories/task/TaskAssigneeRepository";
import { TaskCommentRepository } from "./Database/repositories/task/TaskCommentRepository";
import { TaskPermissionRepository } from "./Database/repositories/task/TaskPermissionRepository";

import { AuditRepository } from "./Database/repositories/audit/AuditRepository";

import { AuthService } from "./Services/auth/AuthService";
import { UserService } from "./Services/users/UserService";
import { EntityService } from "./Services/entity/EntityService";
import { HealthService } from "./Services/health/HealthService";

import { TeamService } from "./Services/team/TeamService";
import { TeamMemberService } from "./Services/team/TeamMemberService";

import { ProjectService } from "./Services/project/ProjectService";
import { ProjectTagService } from "./Services/project/ProjectTagService";
import { ProjectWatcherService } from "./Services/project/ProjectWatcherService";

import { TaskService } from "./Services/task/TaskService";
import { TaskCommentService } from "./Services/task/TaskCommentService";
import { TaskAssigneeService } from "./Services/task/TaskAssigneeService";

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
import { TagController } from "./WebAPI/controllers/TagController";

export const logger = new ConsoleLoggerService();
export const db = new DbManager(logger);

// Repositories
const userRepo = new UserRepository(db, logger);
const entityRepo = new EntityRepository(db, logger);
const auditRepo = new AuditRepository(db, logger);

const teamRepo = new TeamRepository(db, logger);
const teamMemberRepo = new TeamMemberRepository(db, logger);
const teamPermRepo = new TeamPermissionRepository(db, logger);

const projectRepo = new ProjectRepository(db, logger);
const projectTagRepo = new ProjectTagRepository(db, logger);
const projectWatcherRepo = new ProjectWatcherRepository(db, logger);
const projectPermRepo = new ProjectPermissionRepository(db, logger);

const taskRepo = new TaskRepository(db, logger);
const taskAssigneeRepo = new TaskAssigneeRepository(db, logger);
const taskCommentRepo = new TaskCommentRepository(db, logger);
const taskPermRepo = new TaskPermissionRepository(db, logger);

// Services
const authService = new AuthService(userRepo);
const userService = new UserService(userRepo);
const entityService = new EntityService(entityRepo);
const healthService = new HealthService(db, userRepo);
const auditService = new AuditService(auditRepo);

const teamService = new TeamService(teamRepo, teamPermRepo);
const teamMemberService = new TeamMemberService(teamMemberRepo, teamPermRepo, userRepo);

const projectService = new ProjectService(projectRepo, projectPermRepo);
const projectTagService = new ProjectTagService(projectTagRepo, projectPermRepo);
const projectWatcherService = new ProjectWatcherService(projectRepo, projectWatcherRepo, projectPermRepo);

const taskService = new TaskService(taskRepo, taskPermRepo);
const taskAssigneeService = new TaskAssigneeService(taskAssigneeRepo, taskPermRepo, userRepo);
const taskCommentService = new TaskCommentService(taskCommentRepo, taskAssigneeRepo, taskPermRepo);

// Express
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json());

app.use("/api/v1", new AuthController(authService, auditService).getRouter());
app.use("/api/v1", new UserController(userService).getRouter());
app.use("/api/v1", new EntityController(entityService).getRouter());
app.use("/api/v1", new HealthController(healthService).getRouter());
app.use("/api/v1", new StatisticsController(healthService).getRouter());
app.use("/api/v1", new TeamController(teamService, teamMemberService).getRouter());
app.use("/api/v1", new TaskController(taskService, taskAssigneeService, taskCommentService).getRouter());
app.use("/api/v1", new ProjectController(projectService, projectTagService, projectWatcherService).getRouter());
app.use("/api/v1", new TagController(projectTagService).getRouter());
app.use("/api/v1", new AuditController(auditService).getRouter());

export default app;