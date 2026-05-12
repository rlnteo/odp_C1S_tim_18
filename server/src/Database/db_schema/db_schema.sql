CREATE DATABASE IF NOT EXISTS nexushub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nexushub;

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(40) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    role ENUM('user','admin') NOT NULL DEFAULT 'user',
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE teams (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    description TEXT,
    avatarUrl VARCHAR(255),
    createdBy INT UNSIGNED NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE TABLE team_members (
    userId INT UNSIGNED NOT NULL,
    teamId INT UNSIGNED NOT NULL,
    role ENUM('owner','member') NOT NULL DEFAULT 'member',
    joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, teamId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE TABLE projects (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    teamId INT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    deadline DATETIME,
    status ENUM('planning','active','on_hold','completed') DEFAULT 'planning',
    priority ENUM('low','medium','high','critical') DEFAULT 'medium',
    createdBy INT UNSIGNED NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE TABLE tags (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE project_tags (
    projectId INT UNSIGNED NOT NULL,
    tagId INT UNSIGNED NOT NULL,
    PRIMARY KEY (projectId, tagId),
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE project_watchers (
    userId INT UNSIGNED NOT NULL,
    projectId INT UNSIGNED NOT NULL,
    watchingSince DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, projectId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    projectId INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
    status ENUM('todo','in_progress','done') DEFAULT 'todo',
    estimatedHours DECIMAL(5,1) NOT NULL DEFAULT 1.0,
    dueDate DATETIME,
    createdBy INT UNSIGNED NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE TABLE task_assignees (
    taskId INT UNSIGNED NOT NULL,
    userId INT UNSIGNED NOT NULL,
    assignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    assignedBy INT UNSIGNED NOT NULL,
    PRIMARY KEY (taskId, userId),
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedBy) REFERENCES users(id)
);

CREATE TABLE comments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    taskId INT UNSIGNED NOT NULL,
    userId INT UNSIGNED NOT NULL,
    content VARCHAR(2000) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE audit_log (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    userId INT UNSIGNED NULL,
    actionType VARCHAR(100) NOT NULL,
    entityType VARCHAR(50),
    entityId INT UNSIGNED,
    description TEXT,
    ipAddress VARCHAR(45),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

DELIMITER $$
CREATE TRIGGER trg_one_owner_before_insert
BEFORE INSERT ON team_members
FOR EACH ROW
BEGIN
    IF NEW.role = 'owner' THEN
        IF (SELECT COUNT(*) FROM team_members 
            WHERE teamId = NEW.teamId AND role = 'owner') > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Team can have only one owner';
        END IF;
    END IF;
END$$
DELIMITER ;