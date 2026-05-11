CREATE DATABASE IF NOT EXISTS nexushub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nexushub;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(40) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    avatarUrl VARCHAR(255),
    role ENUM('user','admin') NOT NULL DEFAULT 'user',
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (CHAR_LENGTH(username) BETWEEN 3 AND 40)
);

CREATE TABLE IF NOT EXISTS teams (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    description TEXT,
    avatarUrl VARCHAR(255),
    createdBy INT UNSIGNED NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (CHAR_LENGTH(name) BETWEEN 2 AND 80),

    FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS team_members (
    userId INT UNSIGNED NOT NULL,
    teamId INT UNSIGNED NOT NULL,
    role ENUM('owner','member') NOT NULL DEFAULT 'member',
    joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (userId, teamId),

    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    teamId INT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    deadline DATETIME NOT NULL,
    status ENUM('planning','active','on_hold','completed') DEFAULT 'planning',
    priority ENUM('low','medium','high','critical') DEFAULT 'medium',
    createdBy INT UNSIGNED NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (CHAR_LENGTH(name) BETWEEN 2 AND 120),

    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tags (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS project_tags (
    projectId INT UNSIGNED NOT NULL,
    tagId INT UNSIGNED NOT NULL,

    PRIMARY KEY (projectId, tagId),

    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_watchers (
    userId INT UNSIGNED NOT NULL,
    projectId INT UNSIGNED NOT NULL,
    watchingSince DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (userId, projectId),

    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    projectId INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority ENUM('low','medium','high','critical') NOT NULL,
    status ENUM('todo','in_progress','done') DEFAULT 'todo',
    estimatedHours DECIMAL(10,2) NOT NULL,
    dueDate DATETIME,
    createdBy INT UNSIGNED NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (CHAR_LENGTH(title) BETWEEN 2 AND 200),
    CHECK (estimatedHours BETWEEN 0.5 AND 500),

    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS task_assignees (
    taskId INT UNSIGNED NOT NULL,
    userId INT UNSIGNED NOT NULL,
    assignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    assignedBy INT UNSIGNED NOT NULL,

    PRIMARY KEY (taskId, userId),

    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedBy) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS comments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    taskId INT UNSIGNED NOT NULL,
    userId INT UNSIGNED NOT NULL,
    content VARCHAR(2000) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    CHECK (CHAR_LENGTH(TRIM(content)) BETWEEN 1 AND 2000),

    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_log (
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

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_team ON projects(teamId);
CREATE INDEX idx_tasks_project ON tasks(projectId);
CREATE INDEX idx_comments_task ON comments(taskId);

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