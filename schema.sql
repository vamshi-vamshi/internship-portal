-- ============================================================
-- Internship Portal v2 - PostgreSQL Schema
-- Run this in your PostgreSQL database (Render shell)
-- ============================================================

-- ===== Users =====
CREATE TABLE IF NOT EXISTS users (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(255)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  role       VARCHAR(10)   NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

-- ===== Internships =====
CREATE TABLE IF NOT EXISTS internships (
  id                       BIGSERIAL      PRIMARY KEY,
  title                    VARCHAR(200)   NOT NULL,
  company                  VARCHAR(200)   NOT NULL,
  description              TEXT,
  location                 VARCHAR(200),
  skills                   VARCHAR(1000),
  min_experience           INT            NOT NULL DEFAULT 0,
  stipend                  DECIMAL(10,2),
  company_application_link VARCHAR(500),
  created_at               TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internships_location ON internships(location);

-- ===== Applications =====
CREATE TABLE IF NOT EXISTS applications (
  id             BIGSERIAL    PRIMARY KEY,
  user_id        BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  internship_id  BIGINT       NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(150) NOT NULL,
  resume_link    VARCHAR(500),
  status         VARCHAR(20)  NOT NULL DEFAULT 'APPLIED',
  applied_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, internship_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id        ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship_id  ON applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_status         ON applications(status);

-- ============================================================
-- Default Admin User
-- Password: admin123
-- ============================================================
INSERT INTO users (name, email, password, role)
VALUES ('Admin User', 'admin@portal.com',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCMQLv3i3L1YHzl/aqm9eXe', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Sample Internships
-- ============================================================
INSERT INTO internships (title, company, description, location, skills, min_experience, stipend, company_application_link)
VALUES
('Frontend Developer Intern', 'TechCorp Solutions',
 'Work with our design team to build modern, responsive web interfaces using React and TypeScript.',
 'Bangalore', 'React,JavaScript,TypeScript,HTML,CSS', 0, 18000.00, 'https://techcorp.com/careers'),
('Backend Engineer Intern', 'DataWave Inc',
 'Build and maintain scalable REST APIs using Java Spring Boot and PostgreSQL.',
 'Remote', 'Java,Spring Boot,PostgreSQL,REST API', 1, 20000.00, 'https://datawave.io/jobs'),
('Machine Learning Intern', 'AI Ventures',
 'Assist in developing ML models for NLP and computer vision tasks.',
 'Hyderabad', 'Python,TensorFlow,NumPy,Pandas,Scikit-learn', 0, 25000.00, 'https://aiventures.com'),
('Full Stack Developer Intern', 'StartupHub',
 'End-to-end feature development on our SaaS platform.',
 'Delhi', 'React,Node.js,MongoDB,Express', 1, 15000.00, 'https://startuphub.in/careers'),
('DevOps Intern', 'CloudBase Systems',
 'Help automate CI/CD pipelines and manage AWS infrastructure.',
 'Remote', 'Docker,Kubernetes,AWS,Jenkins,Linux', 0, 22000.00, 'https://cloudbase.io'),
('Android Developer Intern', 'MobileFirst Labs',
 'Develop and maintain features for our flagship Android application.',
 'Mumbai', 'Kotlin,Android,Java,Firebase', 0, 16000.00, 'https://mobilefirstlabs.com')
ON CONFLICT DO NOTHING;
