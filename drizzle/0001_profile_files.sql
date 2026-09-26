CREATE TABLE IF NOT EXISTS profile_files (
 id TEXT PRIMARY KEY NOT NULL,
 owner TEXT NOT NULL,
 subject TEXT NOT NULL,
 kind TEXT NOT NULL,
 name TEXT NOT NULL,
 mime TEXT NOT NULL,
 size INTEGER NOT NULL,
 category TEXT NOT NULL,
 content BLOB NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS profile_files_owner_subject ON profile_files(owner,subject,kind);
