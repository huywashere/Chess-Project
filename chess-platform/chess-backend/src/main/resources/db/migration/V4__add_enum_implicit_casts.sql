-- V4: Add implicit casts from varchar/character varying to PostgreSQL enums
-- This allows Hibernate and other JDBC clients to insert/update varchar without explicit type casting

DO $$ BEGIN
    CREATE CAST (character varying AS "UserRole") WITH INOUT AS IMPLICIT;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE CAST (character varying AS game_result) WITH INOUT AS IMPLICIT;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE CAST (character varying AS termination_type) WITH INOUT AS IMPLICIT;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
